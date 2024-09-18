# SceneView Manager

This module provides everything related to the 3D view of the current scene.

Use `SceneViewManager.getView()` to get the actual React component.

## scene-canvas-view

This React component is just a simple Canvas which will be paint with images
received from Brayns renderer.

If you are looking for the axis gizmo, snapshot buttons or simulation bar,
please visit `view/app`.

## camera-transfo-updater

This module is responsible of moving the camera around according to gestures.
