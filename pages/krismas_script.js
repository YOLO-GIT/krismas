// Initialize Matter.js
const {
  Engine,
  Render,
  Runner,
  World,
  Bodies,
  Mouse,
  MouseConstraint,
  Composite,
  Body,
  Events,
} = Matter;

// Create engine and world
const engine = Engine.create();
const world = engine.world;

// Create renderer
const render = Render.create({
  element: document.getElementById("game-area"),
  canvas: document.getElementById("game-canvas"),
  engine: engine,
  options: {
    width: window.innerWidth,
    height: window.innerHeight,
    wireframes: false,
    background: "#CFDEF3", // Light blue winter theme,
  },
});

// Initialize arrays for objects
const giftboxes = [];
const snowballs = [];

// Create ground
const ground = Bodies.rectangle(
  window.innerWidth / 2,
  window.innerHeight - 25,
  window.innerWidth,
  100,
  {
    isStatic: true,
    render: {
      fillStyle: "#fff",
    },
  }
);
World.add(world, ground);

// Create a hoop
const hoopX = window.innerWidth / 2;
const hoopY = window.innerHeight / 2;

const hoopOuter = Bodies.circle(hoopX, hoopY, 80, {
  isStatic: true,
  render: {
    sprite: {
      texture: "../assets/santa_bag (1).png",
      yScale: 0.25,
      xScale: 0.25,
    },
  },
});

const hoopInner = Bodies.circle(hoopX, hoopY, 60, {
  isStatic: true,
  isSensor: true,
  render: {
    fillStyle: "transparent",
  },
});

// Combine outer and inner circles into a composite
const hoop = Composite.create();
Composite.add(hoop, [hoopOuter, hoopInner]);
World.add(world, hoop);

// Function to spawn either a snowball or a giftbox randomly
function spawnRandomObject() {
  const randomX = Math.random() * (window.innerWidth - 100) + 50;
  const isGiftbox = Math.random() < 0.5;

  const object = Bodies.circle(randomX, 85, 45, {
    restitution: 0.8,
    render: {
      sprite: {
        texture: isGiftbox
          ? "../assets/gift (1).png"
          : "../assets/snowboll (1).png",
        yScale: 0.17,
        xScale: 0.17,
      },
    },
  });

  if (isGiftbox) {
    giftboxes.push(object);
  } else {
    snowballs.push(object);
  }
  World.add(world, object);
}

// Add mouse control
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    stiffness: 0.2,
    render: {
      visible: false,
    },
  },
});
World.add(world, mouseConstraint);

// Fit render to screen size
Render.lookAt(render, {
  min: {
    x: 0,
    y: 0,
  },
  max: {
    x: window.innerWidth,
    y: window.innerHeight,
  },
});

// Add event listener for object throwing (snowballs and giftboxes)
Events.on(mouseConstraint, "enddrag", (event) => {
  const draggedBody = event.body;

  // Check if the dragged body is a snowball or a giftbox
  if (draggedBody) {
    const isSnowball = snowballs.includes(draggedBody);
    const isGiftbox = giftboxes.includes(draggedBody);

    if (isSnowball || isGiftbox) {
      const velocityX = event.mouse.absolute.x - draggedBody.position.x;
      const velocityY = event.mouse.absolute.y - draggedBody.position.y;

      // Cap the maximum velocity to prevent unrealistic motion
      const maxVelocity = 20; // Adjust as needed
      const velocityMagnitude = Math.sqrt(velocityX ** 2 + velocityY ** 2);
      const scale = Math.min(1, maxVelocity / velocityMagnitude);

      const velocityMultiplier = isGiftbox ? 0.15 : 0.2; // Slower for giftboxes
      Body.setVelocity(draggedBody, {
        x: velocityX * velocityMultiplier * scale,
        y: velocityY * velocityMultiplier * scale,
      });

      // Apply the capped velocity
      Body.setVelocity(draggedBody, {
        x: velocityX * 0.2 * scale,
        y: velocityY * 0.2 * scale,
      });

      // Optionally add different logic for snowballs or giftboxes
      if (isGiftbox) {
        console.log("Giftbox thrown!");
      } else if (isSnowball) {
        console.log("Snowball thrown!");
      }
    }
  }
});

// Score tracking
let score = 0;
const scoreDisplay = document.getElementById("score-display");

// Collision handling
Events.on(engine, "collisionStart", (event) => {
  const pairs = event.pairs;
  pairs.forEach((pair) => {
    const { bodyA, bodyB } = pair;

    if (
      (bodyA === hoopInner && giftboxes.includes(bodyB)) ||
      (bodyB === hoopInner && giftboxes.includes(bodyA))
    ) {
      const giftbox = bodyA === hoopInner ? bodyB : bodyA;

      score += 10;
      scoreDisplay.textContent = `Score: ${score}`;

      World.remove(world, giftbox);
      giftboxes.splice(giftboxes.indexOf(giftbox), 1);
    }

    // Check for snowball collision
    if (
      (bodyA === hoopInner && snowballs.includes(bodyB)) ||
      (bodyB === hoopInner && snowballs.includes(bodyA))
    ) {
      const snowball = bodyA === hoopInner ? bodyB : bodyA;

      // Deduct points for snowball
      score -= 5; // Adjust the penalty as needed
      scoreDisplay.textContent = `Score: ${score}`;

      // Remove the snowball from the world and array
      World.remove(world, snowball);
      snowballs.splice(snowballs.indexOf(snowball), 1);
    }
  });
});

// Remove off-screen objects
Events.on(engine, "afterUpdate", () => {
  [...giftboxes, ...snowballs].forEach((obj) => {
    if (obj.position.y > window.innerHeight) {
      World.remove(world, obj);
      const index = giftboxes.includes(obj)
        ? giftboxes.indexOf(obj)
        : snowballs.indexOf(obj);
      if (index !== -1) {
        giftboxes.includes(obj)
          ? giftboxes.splice(index, 1)
          : snowballs.splice(index, 1);
      }
    }
  });
});

// Update the button event listener
document
  .getElementById("spawn-button")
  .addEventListener("click", spawnRandomObject);

// Run engine and renderer
Engine.run(engine);
Render.run(render);

// Handle window resize
window.addEventListener("resize", () => {
  render.options.width = window.innerWidth;
  render.options.height = window.innerHeight;
  Render.lookAt(render, {
    min: {
      x: 0,
      y: 0,
    },
    max: {
      x: window.innerWidth,
      y: window.innerHeight,
    },
  });
});
