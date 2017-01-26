w = window;

function initThree() {
    w.renderer = new THREE.WebGLRenderer({ antialias : true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    w.scene = new THREE.Scene();
    w.camera = new THREE.PerspectiveCamera(75,
            window.innerWidth / window.innerHeight, 
            0.1, 1000);

    w.camcon = new THREE.OrbitControls(camera, renderer.domElement);
    camera.position.z = 0;
    camera.position.x = -140;
    camera.position.y = 0;

    w.clock = new THREE.Clock();
    window.addEventListener('resize', onWindowResize, false);     
}

function initStats() {
    w.stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.getElementById("Stats-output").appendChild(stats.domElement);

    w.rstat = new THREEx.RendererStats();
    rstat.domElement.style.position = 'absolute';
    rstat.domElement.style.left = '0px';
    rstat.domElement.style.bottom = '0px';
    document.body.appendChild(rstat.domElement);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function main() {
    initThree();
//    initStats();

    w.t0 = 0;

    init_materials();
    init_geometry();
    play_sound();

    render();
}


/* =====================================*/
// REN

function init_geometry() {
    // floor
    var plane_geo = new THREE.PlaneGeometry(128*3, 128*2);
    var plane = new THREE.Mesh(plane_geo, w.uv_mat);
    plane.rotation.y = Math.PI / 2;
    plane.position.y = -2;
    plane.position.x = 10;
    scene.add(plane);

    // equaline
    var line_geo = new THREE.Geometry();
    for(var i=-64;i<64;++i) 
        line_geo.vertices.push(new THREE.Vector3(0, 4.25, i));
    w.line = new THREE.Line(line_geo, line_mat_eq);
    scene.add(line);

    // stars
    var star_geo = new THREE.Shape();
    star_geo.moveTo(8, 0);
    star_geo.lineTo(0, 16);
    star_geo.lineTo(-8, 0);

    star_geo.lineTo(12, 10);
    star_geo.lineTo(-12, 10);

    star_geo.lineTo(8, 0);


    let gns = function(t, pos, mat) {
        var k = 0;
        if(t == 1)
            k = new THREE.Points(star_pts, mat);
        if(t==2)
            k = new THREE.Line(star_pts, mat);
        k.rotation.y = Math.PI / 2;
        k.position.x = pos.x;
        k.position.y = pos.y;
        k.position.z = pos.z;
        return k;
    };

    var star_pts = star_geo.createSpacedPointsGeometry();

    w.points_star = 
        gns(1, new THREE.Vector3(0, 80, -90), pts_mat0);
    w.points_star1 =
        gns(1, new THREE.Vector3(0, 60, 90), pts_mat1);
    w.points_star2 = 
        gns(1, new THREE.Vector3(2, 50, -100), pts_mat2);

    w.points_star3 = 
        gns(1, new THREE.Vector3(9, 90, 0), pts_mat2);

    
    scene.add(points_star);
    scene.add(points_star2);
    scene.add(points_star3);
    scene.add(points_star1);

    // stars geo
    var stars_ge0 = new THREE.Geometry();
    for(var i=0;i<40*3;++i) {
        stars_ge0.vertices.push(
                new THREE.Vector3(2, 
                    THREE.Math.randFloat(20, 100),
                    THREE.Math.randFloat(-127, 127)));
    }
    w.points_starsn = new THREE.Points(stars_ge0, pts_mats);

    scene.add(points_starsn);    

    // heart geo
    var x = 0, y = 0;
    var heartShape = new THREE.Shape(); 
    heartShape.moveTo( x + 25, y + 25 );
    heartShape.bezierCurveTo( x + 25, y + 25, x + 20, y, x, y );
    heartShape.bezierCurveTo( x - 30, y, x - 30, y + 35,x - 30,y + 35 );
    heartShape.bezierCurveTo( x - 30, y + 55, x - 10, y + 77, x + 25, y + 95 );
    heartShape.bezierCurveTo( x + 60, y + 77, x + 80, y + 55, x + 80, y + 35 );
    heartShape.bezierCurveTo( x + 80, y + 35, x + 80, y, x + 50, y );
    heartShape.bezierCurveTo( x + 35, y, x + 25, y + 25, x + 25, y + 25 );

    var heart_pts = heartShape.createSpacedPointsGeometry();
    w.heart = new THREE.Points(heart_pts, pts_mat0);
    w.heart.scale.x = 0.25;
    w.heart.scale.y = 0.25;
    w.heart.scale.z = 0.25;
    w.heart.position.y = 50;

    heart.rotation.y = Math.PI / 2;
    heart.rotation.x = THREE.Math.degToRad(180);
    scene.add(heart);
}


function init_textures() {
    var tl = new THREE.TextureLoader();
    
    w.uv_tex = tl.load('za.jpg');
    
}

function init_materials() {
    init_textures();
    w.uv_mat = new THREE.MeshBasicMaterial({
        map : w.uv_tex,
        side : THREE.DoubleSide
    });

    w.line_mat0 = new THREE.LineBasicMaterial({
        color : 0xff0000,
        linewidth : 1
    });

    w.line_mat_eq = new THREE.LineBasicMaterial({
        color : 0xff0000,
        linewidth : 2});

    w.pts_mat0 = new THREE.PointsMaterial({color:0xaacc00});
    w.pts_mat1 = new THREE.PointsMaterial({color:0xccab14});
    w.pts_mat2 = new THREE.PointsMaterial({color:0xff0000});
    w.pts_mats = new THREE.PointsMaterial({color:0xff0000});
}

function update_equalizer() {
    w.af = anal.getFrequencyData();

    let t1 = clc_mus.getElapsedTime();
    /* mid tones */
    w.mid0 = 0.1 + af[128] * 0.03;
    w.mid1 = 0.1 + af[129] * 0.02;

    for(var i=0;i<128;++i) 
        line.geometry.vertices[i].y = af[i] / 16;

    line.geometry.verticesNeedUpdate = true;    

    let m25 = Math.sin(0.25 * Math.PI * t1);
    let m12 = Math.sin(0.12 * Math.PI * t1);
    let mg25 = Math.sin(0.25 * Math.PI * (t1*mid0));

    /* Geoscales */
    points_star.rotation.x = m25;
    points_star1.rotation.y = m12;

    points_star2.scale.x = mid0;
    points_star2.scale.y = mid1;

    points_star3.rotation.x = -m25;
    points_star3.scale.x = mid0;
    points_star3.scale.y = mid1;

    heart.scale.x = mid0 * 0.2;
    heart.scale.y = mid1 * 0.2;

    /* Colors of materials */
    pts_mat0.color.r = m25;

    pts_mat2.color.b = mid0;
    pts_mat2.color.g = m25;

    pts_mats.color.g = mid0;
    pts_mats.color.b = m12;

    //line_mat_eq.color.b = m12;

    /* Background */
    uv_mat.color.r = Math.sin(0.09 * Math.PI * t1); 
    uv_mat.color.g = Math.cos(0.05 * Math.PI * t1);

}

function play_sound() {
    w.listener = new THREE.AudioListener();
    camera.add(listener);
    
    w.aloader = new THREE.AudioLoader();

    w.snd0 = new THREE.Audio(listener);
    aloader.load('dt.mp3', function(buffer) {
        snd0.setBuffer(buffer);
        snd0.setVolume(0.75);
        snd0.setLoop(true);
        snd0.play();
        w.clc_mus = new THREE.Clock();
        setInterval(update_equalizer, 60);
    });


    w.anal = new THREE.AudioAnalyser(snd0, 512);

}

function render() {
    w.delta = clock.getDelta();

    //rstat.update(renderer);

    //stats.begin();

        camcon.update(delta);

    //stats.end();

    requestAnimationFrame(render);
    renderer.render(scene, camera);
}
