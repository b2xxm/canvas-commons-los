import {makeScene2D, Rect, Circle, Ray, Spline, Txt, Node, Camera} from '@canvas-commons/2d';
import {
    createRef, waitFor, loop, linear, createRefArray,
    sequence, createSignal, chain, all, any, ReferenceArray
} from '@canvas-commons/core';

type Obstacle = { x: number; y: number; width: number; height: number }

function slabIntersection(origin: { x: number, y: number }, direction: { x: number, y: number }, rect: Obstacle) {
    const minX = rect.x - rect.width / 2;
    const maxX = rect.x + rect.width / 2;
    const minY = rect.y - rect.height / 2;
    const maxY = rect.y + rect.height / 2;

    let tMin = -Infinity;
    let tMax = Infinity;

    if (Math.abs(direction.x) < 0.01) {
        if (origin.x < minX || origin.x > maxX)
            return null;
    } else {
        const tx1 = (minX - origin.x) / direction.x;
        const tx2 = (maxX - origin.x) / direction.x;

        tMin = Math.max(tMin, Math.min(tx1, tx2));
        tMax = Math.min(tMax, Math.max(tx1, tx2));
    }

    if (Math.abs(direction.y) < 0.01) {
        if (origin.y < minY || origin.y > maxY)
            return null;
    } else {
        const ty1 = (minY - origin.y) / direction.y;
        const ty2 = (maxY - origin.y) / direction.y;

        tMin = Math.max(tMin, Math.min(ty1, ty2));
        tMax = Math.min(tMax, Math.max(ty1, ty2));
    }

    if (tMax < 0 || tMin > tMax)
        return null;

    return tMin >= 0 ? tMin : tMax;
}

function createBoxNode(obstacle: Obstacle, refArray: ReferenceArray<Spline>) {
    return <Spline ref={refArray} lineWidth={5} stroke="#ffffff" smoothness={0} end={0} closed position={[obstacle.x, obstacle.y]} points={[
        [-obstacle.width / 2, -obstacle.height / 2],
        [-obstacle.width / 2, obstacle.height / 2],
        [obstacle.width / 2, obstacle.height / 2],
        [obstacle.width / 2, -obstacle.height / 2]
    ]}/>;
}

export default makeScene2D(function* (view) {
    const textProperties = {
        fill: "#ffffff",
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 700
    }
    
    const blueprint = createRef<Rect>();
    const playerMarker = createRef<Circle>();
    const comment = createRef<Txt>();
    const camera = createRef<Camera>();
    const zoomIndicator = createRef<Rect>();
    const stageHider = createRef<Rect>();

    const boxRefs = createRefArray<Spline>();
    const rayRefs = createRefArray<Ray>();
    const gridLines = [];

    const playerRotation = createSignal(0)
    
    const gridSize = 30;
    const absoluteGridSize = 1980;
    const gridCount = 62;
    const fov = 60;
    const rayCount = 10;
    
    const obstacles = [
        { x: 600, y: -300, width: 150, height: 300 },
        { x: -750, y: 0, width: 150, height: 750 },
        { x: -450, y: 0, width: 150, height: 300 },
        { x: 450, y: 300, width: 300, height: 300 },
    ];
    
    for (let index = 0; index <= gridCount / 2; index++) {
        const position = index * gridSize;
        const major = index % 5 === 0;
        
        gridLines.push(
            <Rect x={-position} size={[major ? 2 : 1, absoluteGridSize]} fill="#ffffff" opacity={major ? 0.1 : 0.05}/>,
            <Rect x={position} size={[major ? 2 : 1, absoluteGridSize]} fill="#ffffff" opacity={major ? 0.1 : 0.05}/>,
            <Rect y={-position} size={[absoluteGridSize, major ? 2 : 1]} fill="#ffffff" opacity={major ? 0.1 : 0.05}/>,
            <Rect y={position} size={[absoluteGridSize, major ? 2 : 1]} fill="#ffffff" opacity={major ? 0.1 : 0.05}/>,
        );
    }

    for (let index = 0; index < rayCount; index++) {
        const localAngle = -fov / 2 + index * (fov / (rayCount - 1));

        <Ray ref={rayRefs} lineWidth={2} stroke={"#c75353"} fromY={0} zIndex={-3} rotation={localAngle} shadowColor="#ffffff" toY={() => {
            const globalAngle = playerRotation() + localAngle;
            const radians = globalAngle * Math.PI / 180;
            const directionX = Math.sin(radians);
            const directionY = -Math.cos(radians);

            let closestDistance = 1102;

            for (const obstacle of obstacles) {
                const distance = slabIntersection({x: playerMarker().x(), y: playerMarker().y()}, {x: directionX, y: directionY}, obstacle);

                if (distance !== null) { 
                    closestDistance = Math.min(closestDistance, distance);
                }
            }

            return -closestDistance;
        }}/>
    }

    const scene = (<Node>
        <Rect ref={blueprint} fill="#2d3e5b" size={[1920, 1080]} clip>
            {gridLines}
            <Circle ref={playerMarker} fill="#ffffff" rotation={() => playerRotation()}>
                <Ray lineWidth={5} stroke="#cacaca" fromY={0} toY={-1200} lineDash={[30, 30]} rotation={() => fov / 2} zIndex={-2} lineCap="round" lineDashOffset={-9.6}/>
                <Ray lineWidth={5} stroke="#cacaca" fromY={0} toY={-1200} lineDash={[30, 30]} rotation={() => -fov / 2} zIndex={-1} lineCap="round" lineDashOffset={-9.6}/>
                <Circle fill="#ffffff" size={50}/>
                <Ray lineWidth={3} stroke="#2d3e5b" fromY={12} toY={-12} arrowSize={8} zIndex={1} endArrow/>
                {rayRefs.map((node => node))}
            </Circle>
            {obstacles.map(obstacle => createBoxNode(obstacle, boxRefs))}
        </Rect>
        <Txt ref={comment} {...textProperties} y={415} shadowColor="#000000" shadowBlur={20} opacity={0}>
            works well right?
        </Txt>
    </Node>)

    view.add(<>
        <Rect fill="#000000" opacity={0.4} size={[1920, 1080]}/>
        {scene}
        <Rect ref={zoomIndicator} fill="#c7c753" size={[350, 0]} anchor={[0, -1]} opacity={0.2} zIndex={100}/>
        <Camera.Stage cameraRef={camera} scene={scene} size={[700, 250]} position={[345, -450]} anchor={[0, -1]} radius={20} opacity={0}/>
        <Rect ref={stageHider} size={[700, 250]} position={[345, -200]} anchor={[0, 1]} fill="#151515" opacity={0}/>
    </>);

    const stage = view.children()[view.children().length - 2] as Rect;

    yield loop(() => playerMarker().findFirst<Ray>(node => node.zIndex() === -1).lineDashOffset(-60, 2.5, linear).to(0, 0))
    yield loop(() => playerMarker().findFirst<Ray>(node => node.zIndex() === -2).lineDashOffset(-60, 2.5, linear).to(0, 0))

    yield* sequence(
        0.2,
        boxRefs[0].end(1, 1.3),
        boxRefs[1].end(1, 1.2),
        boxRefs[2].end(1, 1),
        boxRefs[3].end(1, 0.9)
    );

    yield* playerRotation(360, 6)
    yield* chain(
        comment().opacity(1, 0.3),
        waitFor(1.5),
        comment().opacity(0, 0.3),
        comment().text("not really..", 0),
        comment().opacity(1, 0.3),
        waitFor(1.2),
        comment().opacity(0, 0.3)
    );

    yield* all(
        boxRefs[0].opacity(0, 0.3),
        boxRefs[1].opacity(0, 0.3),
        boxRefs[2].opacity(0, 0.3),
        boxRefs[3].opacity(0, 0.3)
    );

    obstacles.push({ x: 0, y: 75, width: 150, height: 75 });
    obstacles.push({ x: 0, y: 350, width: 300, height: 400 });
    blueprint().add(createBoxNode(obstacles[4], boxRefs));
    blueprint().add(createBoxNode(obstacles[5], boxRefs));
    
    yield* any(
        all(
            boxRefs[4].end(1, 1),
            boxRefs[5].end(1, 1),
            blueprint().size.x(600, 2),
            blueprint().size.y(900, 1),
            blueprint().radius(20, 1),
            blueprint().anchor.x(-1, 1.5),
            blueprint().x(-870, 1.5),
        ),
        playerMarker().y(-300, 2.5),
        playerRotation(180, 3)
    );

    yield* all(
        camera().centerOn(boxRefs[4], 0),
        camera().zoom(2, 0)
    );

    yield* chain(
        stageHider().opacity(1, 0),
        stage.opacity(1, 0),
        zoomIndicator().position.abs([boxRefs[4].position.abs.x(), boxRefs[4].position.abs.y() - 125/2], 0),
        all(
            stageHider().size([700, 0], 0.9),
            zoomIndicator().size([350, 125], 0.9)
        ),
        zoomIndicator().opacity(0, 0.4),
        waitFor(0.3)
    );

    yield* all(
        ...rayRefs.map((ray, index) => {
            if (index >= 2 && index <= 7)
                return all(
                    ray.stroke("#ffffff", 0.4),
                    ray.shadowBlur(20, 0.5)
                )
        })
    );
});