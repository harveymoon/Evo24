worldGridScale = 50
worldGrid = []

foods = []
agents = []
maxAgents = 5000

fitnessGraph = []
timeCount = 0;

maxfood = 500

poolsize = 20;

//create a genepool to hold the fitness and synapses of each agent
genepool = []



function setup () {
  // put setup code here
  // the world is a grid of 100x100 cells
  // each cell can be 0 or 1 (empty or solid)
  // agents cannot move into a solid cell

  // get previous winners from local storage
  let previousWinners = localStorage.getItem('winners')

  if (previousWinners) {
    previousWinners = JSON.parse(previousWinners)
    console.log(previousWinners)
    for (let i = 0; i < previousWinners.length; i++) {
      genepool.push([previousWinners[i][0], previousWinners[i][1]])
    }
  }

  createCanvas(windowWidth, windowHeight)
  foodCount = 0

  // create a 2d array of 100x100 cells
  for (let i = 0; i < width / worldGridScale; i++) {
    worldGrid[i] = []
    for (let j = 0; j < height / worldGridScale; j++) {
      solid = random(1) < 0.2
      worldGrid[i][j] = solid
      // if not solid, add some food randomly in that cell area
      if (!solid) {
        for (let k = 0; k < 2; k++) {
          let x = random(i * worldGridScale, (i + 1) * worldGridScale)
          let y = random(j * worldGridScale, (j + 1) * worldGridScale)
          //cluster the food
          for (let l = 0; l < 5; l++) {
            let xx = random(x - 10, x + 10)
            let yy = random(y - 10, y + 10)
            foodCount += 1
            if (foodCount < maxfood) {
              // foods.push(createVector(xx, yy))
            }
          }
          // foods.push(createVector(x, y))
        }
      }
    }
  }

  
  // for (let i = 0; i < maxAgents; i++) {
  //   agents.push(new Agent(width / 2, height / 2))
  // }
  makeAgents()
}

function makeAgents(){

  while (agents.length < maxAgents) {
    // create a new agent
    if (genepool.length > 2 && random(1) < 0.5) {
      // create a new agent from the genepool
      let parentA = genepool[int(random(genepool.length))][1]
      let parentB = genepool[int(random(genepool.length))][1]
      let newBrain = Mutate(parentA, parentB, 0.1)
      agents.push(new Agent(width / 2, height / 2, newBrain))
    } else {
      agents.push(new Agent(width / 2, height / 2))
    }
    // agents.push(new Agent(width / 2, height / 2))
  }

}

function drawFitnessGraph(){

}

function draw () {

  if(frameRate() < 30){
    maxAgents--
  }else{
    maxAgents++
  }

  background(100)

  timeCount++

  if(timeCount%10 == 0){
    minFitness = genepool[genepool.length - 1][0]
    maxFitness = genepool[0][0]
    fitnessGraph.push([minFitness, maxFitness])
  }

  /// add food when mouse is pressed
  if (mouseIsPressed) {
    foods.push(createVector(mouseX + random(-10, 10), mouseY + random(-10, 10)))
  }

  // // draw a circle at the mouse position
  // fill(200)
  // stroke(200)
  // strokeWeight(1)
  // ellipse(mouseX, mouseY, 48, 48)

  // update and draw the agent
  // agent.update()
  for (let i = 0; i < agents.length; i++) {
    if (agents[i].fuel < 0) {
      finalFitness = agents[i].foodCollected
      // add the agent to the genepool
      if (finalFitness > 0) {
        genepool.push([finalFitness, agents[i].brain])

        // sort the genepool by fitness and keep the top 10
        genepool.sort(function (a, b) {
          return b[0] - a[0]
        })

        genepool = genepool.slice(0, poolsize)

       

      }
      // console.log(genepool)
      agents.splice(i, 1)
    } else {
      agents[i].update()
    }
  }

  // draw the world grid
  for (let i = 0; i < width / worldGridScale; i++) {
    for (let j = 0; j < height / worldGridScale; j++) {
      if (worldGrid[i][j]) {
        fill(0)
        stroke(0)
        strokeWeight(1)
        rect(
          i * worldGridScale,
          j * worldGridScale,
          worldGridScale,
          worldGridScale
        )
      }
    }
  }

  // draw the food
  for (let i = 0; i < foods.length; i++) {
    fill(0, 255, 0)
    stroke(0, 255, 0)
    strokeWeight(1)
    ellipse(foods[i].x, foods[i].y, 6, 6)
  }

  for (let i = 0; i < agents.length; i++) {
    agents[i].draw()
  }

  makeAgents();


  // make food clusters if there are less than 1000 food
  if (foods.length < maxfood) {
    console.log('adding food')

    let x = random(width)
    let y = random(height)

    // make sure the food is not in a solid cell
    let i = floor(x / worldGridScale)
    let j = floor(y / worldGridScale)
    if (worldGrid[i][j] == 1) {
      return
    }
    //cluster the food
    for (let l = 0; l < 15; l++) {
      let xx = random(x - 10, x + 10)
      let yy = random(y - 10, y + 10)

      foods.push(createVector(xx, yy))
    }
  }

// draw the fitness graph
fill(200);
rect(0, 0, width, 200)
stroke(0)

for (let i = 0; i < fitnessGraph.length; i++) {
  let x = i;
  let y1 = map(fitnessGraph[i][0], 0, 500, 0, 200)
  let y2 = map(fitnessGraph[i][1], 0, 500, 0, 200)
  point(x, y1)
  point(x, y2)
}


}

function addTop10ToStorage () {
  // add the top 10 agents to local storage
  let top10 = []
  for (let i = 0; i < 10; i++) {
    top10.push(genepool[i])
  }
  localStorage.setItem('winners', JSON.stringify(top10))
}

function randomBrain () {
  // create a random brain
  let brain = []
  for (let i = 0; i < 10; i++) {
    let src = random(1)
    let dest = random(1)
    let weight = random(1) * 2 - 1
    brain.push([src, dest, weight])
  }
  return brain
}

function Mutate (brainA, brainB, ammt) {
  // create a new brain from two parent brains
  // take half of the synapses from brainA and half from brainB
  // then mutate each synapse by a random amount
  // return the new brain

  let newBrain = []
  for (let i = 0; i < brainA.length; i++) {
    let half = int(brainA.length / 2)
    if (i < half) {
      newBrain.push(brainA[i])
    } else {
      newBrain.push(brainB[i])
    }

    // mutate the new brain

    for (let j = 0; j < newBrain.length; j++) {
      if (random(1) < ammt) {
        newBrain[j][0] = random(1)
        newBrain[j][1] = random(1)
        newBrain[j][2] = random(1) * 2 - 1
      }
    }
  }
}

function findClosestFood (position) {
  // find the closest food to the agent
  let closestFood = null
  let closestDistance = 1000000
  for (let i = 0; i < foods.length; i++) {
    let d = p5.Vector.dist(position, foods[i])
    if (d < closestDistance) {
      closestDistance = d
      closestFood = i
    }
  }
  return [closestFood, closestDistance]
}

// agent class

class Synapse {
  constructor (src, dest, weight, agent) {
    let srcOptions = [
      'getNoise',
      'getSin',
      'getFuel',
      'getVelocity',
      'getAngle',
      'foodInFrontWide',
      'foodInFrontClose',
      'blockedInFront',
      'getNeuron0',
      'getNeuron1'
    ]
    let destOptions = ['applyForce', 'turn', 'addNeuron0', 'addNeuron1']

    // console.log(src, dest, weight)

    //src is float between 0 and 1, find the value of the src
    this.src = srcOptions[int(src * srcOptions.length)]
    this.dest = destOptions[int(dest * destOptions.length)]
    this.weight = weight
    this.agent = agent
  }

  run () {
    // get the value of the src

    let srcValue = this.agent[this.src]()

    if (srcValue == false) {
      srcValue = 0
    }
    if (srcValue == true) {
      srcValue = 1
    }

    if (srcValue == NaN) {
      srcValue = 0
    }

    // console.log(this.src, srcValue)
    // apply the weight
    let weightedValue = srcValue * this.weight
    // console.log(this.weight, weightedValue)

    // apply the value to the dest
    this.agent[this.dest](weightedValue)
  }
}

class Agent {
  /// agent is a little rocket that can rotate and thrust
  // it has a position, velocity, and acceleration

  constructor (x, y, brain = null) {
    this.position = createVector(x, y)
    this.velocity = createVector(0, 0)
    this.acceleration = createVector(0, 0)
    this.angle = 0
    this.r = 3.0
    this.maxspeed = 4
    this.maxforce = 0.1
    this.drag = 0.9
    this.fuel = 100
    this.foodCollected = 0
    this.age = 0

    this.neuron0 = 0
    this.neuron1 = 0

    this.synapses = []

    if (brain == null) {
      this.brain = randomBrain()
    } else {
      this.brain = brain
    }

    for (let i = 0; i < this.brain.length; i++) {
      this.synapses.push(
        new Synapse(this.brain[i][0], this.brain[i][1], this.brain[i][2], this)
      )
    }

    this.color = [(this.brain[0][0] + this.brain[5][0])/2, (this.brain[1][0] + this.brain[6][0])/2, (this.brain[2][0] + this.brain[7][0])/2]
    this.color = [this.color[0] * 255, this.color[1] * 255, this.color[2] * 255]

    // create a random brain
    // for (let i = 0; i < 10; i++) {
    //   let src = random(1)
    //   let dest = random(1)
    //   let weight = random(1) * 2 - 1
    //   this.synapses.push(new Synapse(src, dest, weight, this))
    // }
  }

  // update position based on velocity

  update () {
    this.age++
    // run the synapses
    for (let i = 0; i < this.synapses.length; i++) {
      this.synapses[i].run()
    }

    // check the world grid to see if the agent is in front of a solid cell

    let frontLocation = p5.Vector.add(
      this.position,
      p5.Vector.fromAngle(this.angle).mult(this.r * 5)
    )
    // circle(frontLocation.x, frontLocation.y, 3)

    let i = floor(frontLocation.x / worldGridScale)
    let j = floor(frontLocation.y / worldGridScale)

    this.velocity.add(this.acceleration)
    this.velocity.limit(this.maxspeed)

    this.acceleration.mult(0)
    //drag
    this.velocity.mult(this.drag)

    if (this.blockedInFront()) {
      this.velocity.mult(0)
    } else {
      this.position.add(this.velocity)
    }

    // check position to closest food and eat it if close enough
    let [closestFood, closestDistance] = findClosestFood(this.position)
    if (closestDistance < 10) {
      foods.splice(closestFood, 1)
      this.fuel += 10
      this.foodCollected++
    }
    this.fuel -= this.velocity.mag() / 10
    this.fuel -= 0.1
  }

  getNeuron0 () {
    return this.neuron0
  }

  getNeuron1 () {
    return this.neuron1
  }

  addNeuron0 (value) {
    this.neuron0 += value
    this.neuron0 = constrain(this.neuron0, 0, 1)
  }

  addNeuron1 (value) {
    this.neuron1 += value
    this.neuron1 = constrain(this.neuron1, 0, 1)
  }

  getNoise () {
    return random(1)
  }

  getSin () {
    return sin(this.age / 100)
  }
  // apply a force to the agent
  getFuel () {
    return this.fuel / 100
  }

  getVelocity () {
    return this.velocity.mag() / this.maxspeed
  }

  getAngle () {
    return this.angle / TWO_PI
  }

  foodInFrontWide () {
    let frontLocation = p5.Vector.add(
      this.position,
      p5.Vector.fromAngle(this.angle).mult(this.r * 7)
    )

    let wideDist = false
    let closeDist = false

    let [closestFood, closestDistance] = findClosestFood(frontLocation)
    if (closestDistance < 20) {
      noFill()
      // ellipse(frontLocation.x, frontLocation.y, 40)
      return true
    }
    return false
  }

  foodInFrontClose () {
    // true if there is food within 10 pixels in front of the agent

    let frontLocation = p5.Vector.add(
      this.position,
      p5.Vector.fromAngle(this.angle).mult(this.r * 6)
    )

    let [closestFood, closestDistance] = findClosestFood(frontLocation)
    if (closestDistance < 10) {
      noFill()
      // ellipse(frontLocation.x, frontLocation.y, 20)
      return true
    }
    return false
  }

  blockedInFront () {
    // check the world grid to see if the agent is in front of a solid cell

    let frontLocation = p5.Vector.add(
      this.position,
      p5.Vector.fromAngle(this.angle).mult(this.r * 5)
    )
    // circle(frontLocation.x, frontLocation.y, 3)

    let i = floor(frontLocation.x / worldGridScale)
    let j = floor(frontLocation.y / worldGridScale)

    let stop = false
    // if out of bounds, stop
    if (
      frontLocation.x <= 0 ||
      frontLocation.x > width ||
      frontLocation.y <= 0 ||
      frontLocation.y > height
    ) {
      stop = true
    } else if (worldGrid[i][j]) {
      stop = true
    }

    return stop
  }

  applyForce (force) {
    if (force > 1) {
      force = 1
    }
    if (force <= 0) {
      force = 0
    }
    // this.acceleration.add(force);
    // force is a float, it should move in the current direction of the agent
    let f = p5.Vector.fromAngle(this.angle)
    f.mult(force)
    this.acceleration.add(f)
  }

  turn (relativeAngle) {
    this.angle += relativeAngle
    this.fuel -= abs(relativeAngle)
  }

  draw () {
    // draw a triangle rotated its angle of rotation
    let foodFront = this.foodInFrontClose()
    let theta = this.angle + PI / 2
    fill(127)
    stroke(200)
    strokeWeight(1)
    push()
    translate(this.position.x, this.position.y)
    rotate(theta)
    noStroke();
    fill(this.color[0], this.color[1], this.color[2])
    circle(0, 0, this.r * 2)
   
    // beginShape()
    // vertex(0, -this.r * 2)
    // vertex(-this.r, this.r * 2)
    // vertex(this.r, this.r * 2)
    // endShape(CLOSE)

    // if (foodFront) {
    //   noFill()
    //   stroke(0, 255, 0)
    //   strokeWeight(1)
    //   ellipse(0, 0, 26, 26)
    // }

    // // draw the fuel bar
    // rotate(-theta)
    // fill(255, 0, 0)
    // noStroke()
    // rect(-this.r * 2, this.r * 2, this.r * 4, 2)
    // fill(0, 255, 0)
    // rect(-this.r * 2, this.r * 2, this.r * 4 * (this.fuel / 100), 2)

    pop()
  }
}
