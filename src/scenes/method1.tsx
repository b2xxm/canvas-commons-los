import {makeScene2D, Txt, Rect, Circle, Ray} from '@canvas-commons/2d';
import {
    createRef, waitFor, sequence, any, createRefArray,
    easeOutQuint, all, easeOutBack, delay, createSignal,
    loop, linear, chain, createEffect, spawn
} from '@canvas-commons/core';

export default makeScene2D(function* (view) {
    const textProperties = {
        fill: "#ffffff",
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 700
    }

    const description = [
        { text: "\"Fan raycasting\"", fill: "#41f5a4" },
        { text: " just means casting\nmultiple rays in a fan pattern.", fill: "#ffffff" },
        { text: "\n\nEach ray checks what it hits and\nbuilds a rough view of what's visible.", fill: "#ffffff" },
    ]
    
    const transitionBackground = createRef<Rect>();
    const separator = createRef<Rect>();
    const header = createRef<Txt>();
    const container = createRef<Txt>();
    const darkenBackground = createRef<Rect>();
    const blueprint = createRef<Rect>();
    const playerMarker = createRef<Circle>();
    const rayCountLabel = createRef<Rect>();
    const fovDegreeLabel = createRef<Rect>();
    const fovArc = createRef<Circle>();
    
    const descriptionRefs = createRefArray<Txt>();
    const leftRefs = createRefArray<Rect>();
    const rightRefs = createRefArray<Rect>();
    const topRefs = createRefArray<Rect>();
    const bottomRefs = createRefArray<Rect>();
    const gridLines = [];
    const rays: Ray[] = [];
    
    const fov = createSignal(60)
    const rayCount = createSignal(0)
    
    const gridSize = 30;
    const absoluteGridSize = 1980;
    const gridCount = 62;
    
    for (let index = 0; index <= gridCount / 2; index++) {
        const position = index * gridSize;
        const major = index % 5 === 0;
        
        gridLines.push(
            <Rect ref={leftRefs} x={-position} size={[major ? 2 : 1, 0]} fill="#ffffff" opacity={major ? 0.1 : 0.05}/>,
            <Rect ref={rightRefs} x={position} size={[major ? 2 : 1, 0]} fill="#ffffff" opacity={major ? 0.1 : 0.05}/>,
            <Rect ref={topRefs} y={-position} size={[0, major ? 2 : 1]} fill="#ffffff" opacity={major ? 0.1 : 0.05}/>,
            <Rect ref={bottomRefs} y={position} size={[0, major ? 2 : 1]} fill="#ffffff" opacity={major ? 0.1 : 0.05}/>,
        );
    }

    view.add(<>
        <Rect ref={transitionBackground} size={[1920, 1080]} fill="#161616">
            <Rect size={[1500, 2200]} rotation={-30} x={500} fill="#161616"/>
            <Rect ref={separator} size={[5, 100]} fill="#6bc4ee">
                <Txt {...textProperties} fontSize={90} anchorX={1} x={-30} text="METHOD #1"/>
                <Txt {...textProperties} fontSize={40} anchorX={-1} x={30} zIndex={-1} fill="#6bc4ee" text="FAN RAYCASTING"/>
            </Rect>
        </Rect>
        <Txt ref={header} {...textProperties} fontSize={80}/>
        <Txt ref={container} {...textProperties} fontSize={40} size={[900, 110]} textAlign="center">
            {description.map(section => (
                <Txt ref={descriptionRefs} fill={section.fill} text={section.text} opacity={0}/>
            ))}
        </Txt>
        <Rect ref={darkenBackground} fill="#000000" opacity={0} size={[1920, 1080]}/>
        <Rect ref={blueprint} fill="#2d3e5b" size={500} opacity={0} radius={20} clip>
            {gridLines}
            <Circle ref={playerMarker} fill="#ffffff" y={125} opacity={0}>
                <Ray lineWidth={5} stroke="#cacaca" fromY={0} toY={-1200} lineDash={[30, 30]} rotation={() => fov() / 2} zIndex={-2} end={0} lineCap="round"/>
                <Ray lineWidth={5} stroke="#cacaca" fromY={0} toY={-1200} lineDash={[30, 30]} rotation={() => -fov() / 2} zIndex={-1} end={0} lineCap="round"/>
                <Circle fill="#ffffff"/>
                <Circle ref={fovArc}
                    stroke="#f0c551" lineWidth={4} size={100} rotation={-90} lineCap="round" zIndex={-3} end={0}
                    startAngle={() => -fov() / 2} endAngle={() => fov() / 2}
                />
                <Ray lineWidth={3} stroke="#2d3e5b" fromY={12} toY={-12} arrowSize={8} opacity={0} zIndex={1} endArrow/>
            </Circle>
            <Rect size={[400, 150]} position={[-70, 300]}>
                <Rect ref={rayCountLabel} size={[400, 50]} y={-15} opacity={0}>
                    <Txt {...textProperties} fontSize={40} textAlign="right" anchorX={1} x={40}> RAYS: </Txt>
                    <Txt {...textProperties} fontSize={40} textAlign="center" anchorX={-1} x={60} fill="#c75353" text={() => ` ${rayCount().toFixed(0)}`}/>
                </Rect>
                <Rect ref={fovDegreeLabel} size={[400, 50]} y={45} opacity={0}>
                    <Txt {...textProperties} fontSize={40} textAlign="right" anchorX={1} x={40}> FOV: </Txt>
                    <Txt {...textProperties} fontSize={40} textAlign="center" anchorX={-1} x={60} fill="#f0c551" text={() => ` ${fov().toFixed(0)}`}/>
                </Rect>
            </Rect>
        </Rect>
        <Txt ref={descriptionRefs} {...textProperties} fontSize={40} size={[400, 150]} x={-668} opacity={0} textAlign="center">
            {"Unfortunately\nthe ray count is\narbitrary"}
        </Txt>
        <Txt ref={descriptionRefs} {...textProperties} fontSize={40} size={[400, 150]} x={668} opacity={0} textAlign="center" alignContent="center">
            {"Let's introduce\nobstacles"}
        </Txt>
    </>);

    createEffect(() => {
        const targetCount = Math.round(rayCount());

        for (let length = rays.length; length < targetCount; length++) {
            const ray = (<Ray lineWidth={2} stroke={'#c75353'} fromY={0} toY={-1200} end={0} zIndex={-4}/>) as Ray;
            rays.push(ray);
            
            playerMarker().add(ray);
            spawn(ray.end(1, 0.4, linear));
        }

        for (let index = 0; index < rays.length; index++) {
            const ray = rays[index]
            ray.rotation(-fov() / 2 + index * (fov() / (rayCount() - 1)))
        }
    });
    
    yield* waitFor(0.3);
    yield* any(transitionBackground().position.x(-2800, 2.1), waitFor(1.8));

    yield* any(sequence(
        0.3,
        header().text("WHAT", 0),
        header().text("WHAT IS", 0),
        header().text("WHAT IS FAN", 0),
        header().text("WHAT IS FAN RAYCASTING", 0),
        header().text("WHAT IS FAN RAYCASTING?", 0.7)
    ), waitFor(1.6));

    yield* waitFor(0.3);
    yield* any(header().position.y(-400, 0.6), waitFor(0.3));

    yield* chain(
        descriptionRefs[0].opacity(1, 0.5),
        descriptionRefs[1].opacity(1, 0.5),
        waitFor(1.2),
        container().height(250, 0.6),
        descriptionRefs[2].opacity(1, 0.5),
        waitFor(2)
    )

    yield* any(
        header().filters.blur(7, 0.5),
        container().filters.blur(7, 0.5),
        darkenBackground().opacity(0.4, 0.3),
        sequence(0.01, ...leftRefs.map(line => line.height(absoluteGridSize, 0.7))),
        sequence(0.01, ...rightRefs.map(line => line.height(absoluteGridSize, 0.7))),
        sequence(0.01, ...topRefs.map(line => line.width(absoluteGridSize, 0.7))),
        sequence(0.01, ...bottomRefs.map(line => line.width(absoluteGridSize, 0.7))),
        waitFor(0.1)
    );

    yield* all(
        blueprint().opacity(1, 0.3),
        blueprint().size(750, 0.8, easeOutQuint)
    );

    yield* any(
        playerMarker().findFirst<Circle>(node => node instanceof Circle).size(50, 0.2, easeOutBack),
        playerMarker().opacity(1, 0.1),
        playerMarker().findFirst<Ray>(node => node.zIndex() === 1).opacity(1, 0.3)
    );

    yield loop(() => playerMarker().findFirst<Ray>(node => node.zIndex() === -1).lineDashOffset(-60, 2.5, linear).to(0, 0))
    yield loop(() => playerMarker().findFirst<Ray>(node => node.zIndex() === -2).lineDashOffset(-60, 2.5, linear).to(0, 0))

    yield* any(
        playerMarker().findFirst<Ray>(node => node.zIndex() === -1).end(1, 1.8, easeOutQuint),
        playerMarker().findFirst<Ray>(node => node.zIndex() === -2).end(1, 1.8, easeOutQuint),
        waitFor(0.7)
    )

    yield* all(
        rayCountLabel().opacity(1, 0.4, easeOutQuint),
        rayCountLabel().y(-30, 0.5, easeOutQuint),
        delay(0.1, all(
            fovDegreeLabel().opacity(1, 0.4, easeOutQuint),
            fovDegreeLabel().y(30, 0.5, easeOutQuint)
        ))
    );

    yield* chain(
        waitFor(0.5),
        all(
            rayCount(10, 2, easeOutQuint),
            rayCountLabel().childAs<Txt>(1).fill("#ffffff", 0.2).wait(1).to("#c75353", 0.5),
            descriptionRefs[3].opacity(1, 0.5),
        ),
        waitFor(0.2),
        fovArc().end(1, 0.6, easeOutQuint)
    );
    
    yield* chain(
        all(
            fov(90, 1.2),
            fovDegreeLabel().childAs<Txt>(1).fill("#ffffff", 0.2).wait(0.7).to("#f0c551", 0.5)
        ), all(
            fov(40, 1.6),
            fovDegreeLabel().childAs<Txt>(1).fill("#ffffff", 0.2).wait(0.9).to("#f0c551", 0.5)
        ), waitFor(0.1), all(
            fov(60, 1),
            fovDegreeLabel().childAs<Txt>(1).fill("#ffffff", 0.2).wait(0.6).to("#f0c551", 0.5),
            descriptionRefs[3].opacity(0, 0.5)
        )
    );

    yield* playerMarker().rotation(30, 1).run(all(
        playerMarker().rotation(-30, 2),
        fovArc().start(1, 0.6, easeOutQuint)
    )).run(all(
        playerMarker().rotation(0, 1.5),
        rayCountLabel().opacity(0, 0.5),
        fovDegreeLabel().opacity(0, 0.5)
    ));

    yield* descriptionRefs[4].opacity(1, 0.5).wait(1.7).to(0, 0.5);
    yield* all(
        blueprint().size([1920, 1080], 1),
        blueprint().radius(0, 1),
        playerMarker().y(0, 1.7)
    );
});