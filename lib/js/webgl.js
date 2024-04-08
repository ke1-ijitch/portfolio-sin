// シーンの作成
const scene = new THREE.Scene();

// カメラの作成
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(0, 0, +700);

// レンダラーの作成
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#myCanvas')
});
renderer.setSize(window.innerWidth, window.innerHeight);

// 球体を作成 new THREE.SphereGeometry(直径, 経度分割数, 緯度分割数)
const geometry = new THREE.SphereBufferGeometry(200, 50, 50);
const material = new THREE.MeshPhysicalMaterial({
    wireframe: true,
    color: 0x5653FF,
    transparent: true,
    transmission: 1,
    roughness: 0.3,
    ior: 1.4,
    specularColor: 0x5653FF
});

// メッシュを作成
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

//ライトを追加
let lightTop = new THREE.DirectionalLight(0xFF, 1);
lightTop.position.set(50, 40, -50);
scene.add(lightTop);

let lightBottom = new THREE.DirectionalLight(0xff, 10000);
lightBottom.position.set(0, 0, 400);
scene.add(lightBottom);

// ウィンドウのリサイズに対応する
window.addEventListener('resize', onWindowResize);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// カメラの位置を調整する
function adjustCameraPosition() {
    const canvasHalfWidth = window.innerWidth / 2;
    const canvasHalfHeight = window.innerHeight / 2;
    const horizontalFOV = (camera.fov * Math.PI) / 180;

    // 画面のアスペクト比を考慮して、カメラの位置を調整
    const distance = Math.abs(canvasHalfHeight / Math.tan(horizontalFOV / 2));
    camera.position.set(0, 0, distance);
}

// 初回実行
onWindowResize();
adjustCameraPosition();

// レンダリングループ
tick();


// レンダリングループ
tick();

function tick() {
    // ジオメトリの頂点座標情報を取得
    const positions = mesh.geometry.attributes.position.array;
    const numVertices = positions.length / 3;

    for (let i = 0; i < numVertices; i++) {
        // 各頂点のXYZ座標
        const x = positions[i * 3];
        const y = positions[i * 3 + 1];
        const z = positions[i * 3 + 2];

        // 高さを計算（波のような効果）
        const nextZ = Math.sin(x * 0.03 + y * 0.02 + Date.now() * 0.002) * 30;

        // 更新したZ座標をセット
        positions[i * 3 + 2] = nextZ;
    }

    // 頂点の更新が必要なことを伝える
    mesh.geometry.attributes.position.needsUpdate = true;

    // レンダリング
    renderer.render(scene, camera);

    // 次のフレームを要求
    requestAnimationFrame(tick);
}
