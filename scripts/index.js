const { Engine, Render, Runner, World, Bodies, Body, Events} = Matter

let cellsHorizontal = 4
let cellsVertical = 4
let width = 1200
let height = 800


let engine=Engine.create()
let { world } = engine;
let render
let runner
let ball

function build(wallV=10,wallIV=15,boundaries=20) {
    
    const unitLengthX = width / cellsHorizontal
    const unitLengthY = height / cellsVertical
    engine.world.gravity.y = 0
    render = Render.create({
        element: document.querySelector('.maze-canvas'),
        engine: engine,
        options: {
            wireframes: false,
            width: width,
            height: height,
            background: '#BAE0BD'
        }
    })

    Render.run(render)
    runner = Runner.create();
    Runner.run(runner, engine)


    

    //Maze generation

    const shuffle = (arr) => {
        let counter = arr.length

        while (counter > 0) {
            const index = Math.floor(Math.random() * counter)
            counter--
            const temp = arr[counter]
            arr[counter] = arr[index]
            arr[index] = temp
        }
        return arr
    }

    const grid = Array(cellsVertical)
        .fill(null)
        .map(() => Array(cellsHorizontal).fill(false))

    const verticals = Array(cellsVertical)
        .fill(null)
        .map(() => Array(cellsHorizontal - 1).fill(false))

    const horizontals = Array(cellsVertical - 1)
        .fill(null)
        .map(() => Array(cellsHorizontal).fill(false))

    const startRow = Math.floor(Math.random() * cellsVertical)
    const startColumn = Math.floor(Math.random() * cellsHorizontal)

    const stepThroughCell = (row, column) => {
        // if i have visited the cell at [row,column] then return
        if (grid[row][column]) {
            return
        }

        //Mark the cell as being visited
        grid[row][column] = true

        //Assemble randomly-ordered list of neighbors
        const neighbors = shuffle([
            [row - 1, column, 'up'],
            [row, column + 1, 'right'],
            [row + 1, column, 'down'],
            [row, column - 1, 'left'],

        ])
        //for each neighbour..
        for (let neighbor of neighbors) {

            const [nextRow, nextColumn, direction] = neighbor

            // See if that neighbour is not of bounds
            if (nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
                continue
            }
            //if we have visited that neighbour , continue to next neighbour
            if (grid[nextRow][nextColumn]) {
                continue
            }
            //remove a wall from either horizontal or vertical
            if (direction === 'left') {
                verticals[row][column - 1] = true
            }
            else if (direction === 'right') {
                verticals[row][column] = true
            }
            else if (direction === 'up') {
                horizontals[row - 1][column] = true
            }
            else if (direction === 'down') {
                horizontals[row][column] = true
            }
            //Visit the next cell
            stepThroughCell(nextRow, nextColumn)
        }





    }

    stepThroughCell(startRow, startColumn)
    horizontals.forEach((row, rowIndex) => {
        row.forEach((open, columnIndex) => {
            if (open) {
                return;
            }

            const wall = Bodies.rectangle(

                columnIndex * unitLengthX + unitLengthX / 2,
                rowIndex * unitLengthY + unitLengthY,
                unitLengthX,
                wallV,
                {
                     
                    label: 'wall',
                    isStatic: true,
                    render: {
                        fillStyle: '#5E9C76'
                    }
                }
            )

            const wall2 = Bodies.rectangle(

                columnIndex * unitLengthX + unitLengthX / 2,
                rowIndex * unitLengthY + unitLengthY,
                unitLengthX,
                wallIV,
                {
                     
                    label: 'wall',
                    isStatic: true,
                    render: {
                        visible: false
                    }
                }
            )



            World.add(world, [wall, wall2])
        })
    })

    verticals.forEach((row, rowIndex) => {
        row.forEach((open, columnIndex) => {
            if (open) {
                return
            }

            const wall = Bodies.rectangle(
                columnIndex * unitLengthX + unitLengthX,
                rowIndex * unitLengthY + unitLengthY / 2,
                wallV,
                unitLengthY,
                {
                     
                    label: 'wall',
                    isStatic: true,
                    render: {
                        fillStyle: '#5E9C76'
                    }
                }
            )
            const wall2 = Bodies.rectangle(
                columnIndex * unitLengthX + unitLengthX,
                rowIndex * unitLengthY + unitLengthY / 2,
                wallIV,
                unitLengthY,
                {
                     
                    label: 'wall',
                    isStatic: true,
                    render: {
                        visible: false
                    }
                }
            )
            World.add(world, [wall, wall2])
        })
    })

    // goal object
    const goal = Bodies.rectangle(
        width - unitLengthX / 2,
        height - unitLengthY / 2,
        unitLengthX * 0.7,
        unitLengthY * 0.7,
        {
            
            isStatic: true,
            label: 'goal',
            render: {
                fillStyle: '#fa4252',
            }

        }
    );
    World.add(world, goal)

    //user Ball
    const ballRadius = Math.min(unitLengthX, unitLengthY) / 4
    ball = Bodies.circle(
        unitLengthX / 2,
        unitLengthY / 2,
        ballRadius,
        {
            frictionAir: 0.05,
            label: 'ball',
            render: {
                fillStyle: '#002f35',
                strokeStyle: '#fa4252',
                lineWidth: 6
            },
        }
    )

    World.add(world, ball)

    //Walls(boundaries)
    const Walls = [

        Bodies.rectangle(width / 2, 0, width, boundaries, { isStatic: true }),
        Bodies.rectangle(width / 2, height, width, boundaries, { isStatic: true }),
        Bodies.rectangle(0, height / 2, boundaries, height, { isStatic: true }),
        Bodies.rectangle(width, height / 2, boundaries, height, { isStatic: true })
    ]
    World.add(world, Walls)

    


}

build()

var motion = true;
document.addEventListener('keydown', (e) => {
    const { x, y } = ball.velocity
    if (motion) {
        if (e.keyCode === 87) {
            Body.setVelocity(ball, { x: 0, y: y - 4 * 0.7 })
            motion = false
        }

        if (e.keyCode === 68) {
            Body.setVelocity(ball, { x: x + 4 * 0.7, y: 0 })
            motion = false
        }
        if (e.keyCode === 83) {
            Body.setVelocity(ball, { x: 0, y: y + 4 * 0.7 })
            motion = false
        }
        if (e.keyCode === 65) {
            Body.setVelocity(ball, { x: x - 4 * 0.7, y: 0 })
            motion = false
        }
    }
    else {
        if (e.keyCode === 87) {
            Body.setVelocity(ball, { x: 0, y: y - 2 })
            // motion=false  
        }

        if (e.keyCode === 68) {
            Body.setVelocity(ball, { x: x + 2, y: 0 })
            // motion=false
        }
        if (e.keyCode === 83) {
            Body.setVelocity(ball, { x: 0, y: y + 2 })
            // motion=false
        }
        if (e.keyCode === 65) {
            Body.setVelocity(ball, { x: x - 2, y: 0 })
            // motion=false
        }
        motion = true
    }

})


// win conditiom
let hc=true
Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach((collision) => {
        const labels = ['ball', 'goal']

        if (labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)) {
            // document.querySelector(".winner").classList.remove('hidden')
            destroy()
            let levelText = parseInt(document.querySelector('#level').innerText)
            document.querySelector('#level').innerHTML=++levelText
            if(hc)
            {
                cellsHorizontal+=1
                hc=false
            }
            else
            {
                cellsVertical+=1
                hc=true
            }
            if(cellsHorizontal>=16 && cellsHorizontal<=25)
            {
                build(5,10)
            }
            else if(cellsHorizontal>=25)
            {
                build(5,10,10)
            }
            else
            {
                build()
            }
            

        }
    })
})

function destroy(){
    World.clear(world);
    Engine.clear(engine);
    Render.stop(render);
    Runner.stop(runner);
    render.canvas.remove();
}