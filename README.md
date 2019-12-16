# threejs-aabb-collision-engine
### simple aabb collision engine for threejs

This is an aabb collision engine for threejs 


## Quick Start

```javascript
import { CollisionEngine } from 'threejs-aabb-collision-engine';

let collisionEngineParams = {
			camera: this.camera,
			trackAfterCollision: true,
			snapDistance: 1,
			resetCallback: () => { this._onEngineReset(); }
		};
let collisionEngine = new CollisionEngine(collisionEngineParams);
```

### On mouse move
```javascript
this.collisionEngine.translate(this.selectedCube, 0, deltaMove.x);
this.collisionEngine.translate(this.selectedCube, 1, deltaMove.y);
```



## Functions

<dl>
<dt><a href="#CollisionEngine">CollisionEngine(params)</a></dt>
<dd><p>Creates an instance of CollisionEngine.
params = {trackAfterCollision,snapDistance,resetOnSnap,resetCallback}</p>
</dd>
</dl>

<a name="CollisionEngine"></a>

## CollisionEngine
**Kind**: global class
**Version**: 1
**Author**: jon

- [threejs-aabb-collision-engine](#threejs-aabb-collision-engine)
		- [simple aabb collision engine for threejs](#simple-aabb-collision-engine-for-threejs)
	- [Quick Start](#quick-start)
		- [On mouse move](#on-mouse-move)
	- [Functions](#functions)
	- [CollisionEngine](#collisionengine)
		- [collisionEngine.translate(object, axis, distance)](#collisionenginetranslateobject-axis-distance)
		- [collisionEngine.addCollider(collider)](#collisionengineaddcollidercollider)
		- [collisionEngine.getMeshColliders() ⇒](#collisionenginegetmeshcolliders-%e2%87%92)
		- [collisionEngine.reset()](#collisionenginereset)

<a name="CollisionEngine+translate"></a>

### collisionEngine.translate(object, axis, distance)
Translates a object in a given axis and distance

**Kind**: instance method of [<code>CollisionEngine</code>](#CollisionEngine)

| Param    | Type                  |
| -------- | --------------------- |
| object   | <code>Object3d</code> |
| axis     | <code>number</code>   |
| distance | <code>number</code>   |

<a name="CollisionEngine+addCollider"></a>

### collisionEngine.addCollider(collider)
adds a new collider to the system

**Kind**: instance method of [<code>CollisionEngine</code>](#CollisionEngine)

| Param    | Type                  |
| -------- | --------------------- |
| collider | <code>Object3D</code> |

<a name="CollisionEngine+getMeshColliders"></a>

### collisionEngine.getMeshColliders() ⇒
Get all colliders in the system

**Kind**: instance method of [<code>CollisionEngine</code>](#CollisionEngine)
**Returns**: []
<a name="CollisionEngine+reset"></a>

### collisionEngine.reset()
reset the real position

