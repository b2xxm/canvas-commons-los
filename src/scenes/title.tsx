import {makeScene2D, Txt, Rect} from '@canvas-commons/2d';
import {createRef, waitFor, all, chain, any} from '@canvas-commons/core';

export default makeScene2D(function* (view) {
    const textProperties = {
        fill: "#ffffff",
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 700
    }

    const innerText = createRef<Txt>();
    const titleBackground = createRef<Rect>();
    const transitionBackground = createRef<Rect>();
    const separator = createRef<Rect>();
    const cover = createRef<Rect>();

    view.add(<>
        <Rect ref={titleBackground} width={1920} height={100} fill="#232323">
            <Txt {...textProperties} fontSize={80}>
                MAKING A LINE OF SIGHT SYSTEM
            </Txt>
        </Rect>
        <Txt ref={innerText} {...textProperties} fontSize={40} zIndex={-1} fill="#fff6a8">
            HOW CAN WE DO THIS?
        </Txt>
        <Rect ref={transitionBackground} size={[1920, 1080]} x={2800} fill="#161616">
            <Rect size={[1500, 2200]} rotation={-30} x={-500} fill="#161616"/>
            <Rect ref={separator} size={[5, 0]} fill="#6bc4ee">
                <Txt {...textProperties} fontSize={90} anchorX={1} x={-30}>
                    METHOD #1
                </Txt>
                <Txt {...textProperties} fontSize={40} anchorX={-1} x={30} zIndex={-1} fill="#6bc4ee">
                    FAN RAYCASTING
                </Txt>
                <Rect ref={cover} size={[600, 100]} anchorX={-1} x={20} fill="#161616"/>
            </Rect>
        </Rect>
    </>);

    yield* waitFor(1);
    yield* all(
        titleBackground().position.y(-25, 0.5),
        innerText().position.y(50, 0.7)
    )

    yield* waitFor(0.3);
    yield* any(
        transitionBackground().position.x(0, 2.1),
        waitFor(1.8)
    );

    yield* all(
        separator().height(100, 0.65),
        chain(waitFor(0.2), cover().position.x(600, 0.95))
    );
});