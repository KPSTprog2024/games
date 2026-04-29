(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Game71View3D = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function create(sceneEl) {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-4.8, 4.8, 3.7, -3.7, 0.1, 100);
    const board = new THREE.Group();
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(6, 10, 8);
    scene.add(ambient, directional, board);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    sceneEl.appendChild(renderer.domElement);

    const INITIAL_CAMERA = new THREE.Vector3(4.5, 3.2, 5.5);
    const LOOK_AT = new THREE.Vector3(0, 0.8, 0);
    let cameraTween = null;

    function resize() {
      const w = sceneEl.clientWidth;
      const h = sceneEl.clientHeight;
      renderer.setSize(w, h);
      const aspect = w / h;
      const view = 4.5;
      camera.left = -view * aspect;
      camera.right = view * aspect;
      camera.top = view;
      camera.bottom = -view;
      camera.updateProjectionMatrix();
    }

    function mountCubes(cubes) {
      board.clear();
      const geo = new THREE.BoxGeometry(1, 1, 1);
      cubes.forEach((cube) => {
        const material = new THREE.MeshLambertMaterial({ color: cube.color === 'black' ? 0x3d3d3d : 0xf8f8f8 });
        const mesh = new THREE.Mesh(geo, material);
        mesh.position.set(cube.x, cube.y + 0.5, cube.z);
        board.add(mesh);
        const line = new THREE.LineSegments(
          new THREE.EdgesGeometry(geo),
          new THREE.LineBasicMaterial({ color: 0x7a86a8 })
        );
        line.position.copy(mesh.position);
        board.add(line);
      });
      const box = new THREE.Box3().setFromObject(board);
      const center = box.getCenter(new THREE.Vector3());
      board.position.sub(center);
    }

    function directionToPosition(direction) {
      if (direction === 'init') return INITIAL_CAMERA.clone();
      if (direction === 'front') return new THREE.Vector3(0, 2.4, 6.8);
      if (direction === 'right') return new THREE.Vector3(6.8, 2.4, 0);
      if (direction === 'left') return new THREE.Vector3(-6.8, 2.4, 0);
      if (direction === 'back') return new THREE.Vector3(0, 2.4, -6.8);
      return new THREE.Vector3(0, 7.2, 0.001);
    }

    function setInitialCamera() {
      camera.position.copy(INITIAL_CAMERA);
      camera.lookAt(LOOK_AT);
    }

    function rotateToDirection(direction, duration = 1000) {
      cameraTween = {
        from: camera.position.clone(),
        to: directionToPosition(direction),
        start: performance.now(),
        duration,
      };
    }

    function animate(now) {
      if (cameraTween) {
        const t = Math.min(1, (now - cameraTween.start) / cameraTween.duration);
        camera.position.lerpVectors(cameraTween.from, cameraTween.to, t);
        camera.lookAt(LOOK_AT);
        if (t >= 1) cameraTween = null;
      }
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    return { resize, mountCubes, setInitialCamera, rotateToDirection, animate };
  }

  return { create };
});
