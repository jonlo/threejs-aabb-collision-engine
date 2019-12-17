import { getBoundsForObjectInAxis } from '../Aabb/aabbOperations';

const SNAP_SCAPE = 0.3;
const SNAP_MARGIN = 0.005;
const SNAP_BOUNDS = Object.freeze({ 'none': 0, 'snapXY': 1, 'snapXZ': 2, 'snapZY': 3 });
const lastDistance = [0, 0, 0];

export function snap(selectedObject, closestObject, movingAxis, deltaMove, snapDistance, onSnapCallback, snapToBound = SNAP_BOUNDS.snapXY) {
	if (!closestObject || !closestObject.object) {
		return;
	}
	let distance = closestObject.distance;
	let axis = closestObject.axis;
	let dir = deltaMove < 0 ? -1 : 1;
	if (distance < snapDistance) {
		if (distance < lastDistance[movingAxis] && distance > SNAP_SCAPE) {
			if (movingAxis === axis) {
				if (snapToBound !== SNAP_BOUNDS.none) {
					if (snapToBounds(selectedObject, closestObject, snapDistance, getAxisForSnapBound(axis, snapToBound), onSnapCallback)) {
						onSnapCallback(selectedObject, axis, selectedObject.position.getComponent(axis) - (distance - SNAP_MARGIN) * dir);
					}
				} else {
					onSnapCallback(selectedObject, axis, selectedObject.position.getComponent(axis) - (distance - SNAP_MARGIN) * dir);
				}
				lastDistance[movingAxis] = 0;
				return movingAxis;
			}
		} else {
			lastDistance[movingAxis] = Math.abs(distance);
		}
	}
}

function snapToBounds(selectedObject, closestObject, snapDistance, axis, onSnapCallback) {
	let selectedObjectPoints = getBoundsForObjectInAxis(selectedObject, axis);
	let closestObjectPoints = getBoundsForObjectInAxis(closestObject.object, axis);
	let minPointsDistance = selectedObjectPoints.min - closestObjectPoints.min;
	let maxPointsDistance = selectedObjectPoints.max - closestObjectPoints.max;
	let minDistance = Math.min(Math.abs(minPointsDistance), Math.abs(maxPointsDistance));
	if (minDistance < snapDistance) {
		if (Math.abs(minPointsDistance) < Math.abs(maxPointsDistance)) {
			onSnapCallback(selectedObject, axis, selectedObject.position.getComponent(axis) - minPointsDistance);
		} else {
			onSnapCallback(selectedObject, axis, selectedObject.position.getComponent(axis) - maxPointsDistance);
		}
		return true;
	}
	return false;
}

function getAxisForSnapBound(axis, snapToBound) {
	switch (snapToBound) {
		case SNAP_BOUNDS.snapXY:
			return axis === 0 ? 1 : 0;
		case SNAP_BOUNDS.snapXZ:
			return axis === 0 ? 2 : 0;
		case SNAP_BOUNDS.snapZY:
			return axis === 1 ? 2 : 1;
	}
}
