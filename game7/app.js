const { Engine, Render, Runner, Bodies, Body, Composite, Events } = Matter;

const width = window.innerWidth;
const height = window.innerHeight;

const engine = Engine.create();
const world = engine.world;
const canvas = document.getElementById('world');
canvas.width = width;
canvas.height = height;

const render = Render.create({
  canvas: canvas,
  engine: engine,
  options: {
    width: width,
    height: height,
    wireframes: false,
    background: '#ffffff'
  }
});
Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);

// Walls
Composite.add(world, [
  Bodies.rectangle(width/2, height + 50, width, 100, { isStatic: true }),
  Bodies.rectangle(-50, height/2, 100, height, { isStatic: true }),
  Bodies.rectangle(width+50, height/2, 100, height, { isStatic: true })
]);

const FRUITS = [
  { radius: 18, color: '#e91e63', name: 'Cherry' },
  { radius: 26, color: '#f44336', name: 'Apple' },
  { radius: 34, color: '#ff9800', name: 'Orange' },
  { radius: 46, color: '#4caf50', name: 'Watermelon' }
];

let activeFruit = null;
let nextType = 0;
const nextEl = document.getElementById('next');
const gameoverEl = document.getElementById('gameover');

function createFruit(type, x, y) {
  const info = FRUITS[type];
  const body = Bodies.circle(x, y, info.radius, {
    label: 'fruit_' + type,
    restitution: 0.2,
    render: {
      fillStyle: info.color
    }
  });
  Composite.add(world, body);
  return body;
}

function spawnFruit() {
  const type = nextType;
  nextType = Math.floor(Math.random() * 3); // next is one of first three types
  nextEl.textContent = 'NEXT: ' + FRUITS[nextType].name;
  activeFruit = createFruit(type, width / 2, 40);
  Body.setStatic(activeFruit, true);
}

function dropFruit() {
  if (activeFruit) {
    Body.setStatic(activeFruit, false);
    activeFruit = null;
    setTimeout(() => {
      spawnFruit();
    }, 500);
  }
}

spawnFruit();
window.addEventListener('pointerdown', dropFruit);

Events.on(engine, 'collisionStart', (evt) => {
  for (const pair of evt.pairs) {
    const a = pair.bodyA;
    const b = pair.bodyB;
    if (a.label.startsWith('fruit_') && a.label === b.label) {
      const type = parseInt(a.label.split('_')[1]);
      if (type < FRUITS.length - 1) {
        const nx = (a.position.x + b.position.x) / 2;
        const ny = (a.position.y + b.position.y) / 2;
        Composite.remove(world, a);
        Composite.remove(world, b);
        const newFruit = createFruit(type + 1, nx, ny);
        Body.setVelocity(newFruit, { x: 0, y: 0 });
      }
    }
  }
});

Events.on(engine, 'afterUpdate', () => {
  // check game over
  Composite.allBodies(world).forEach(b => {
    if (b.position.y < 0 && b.label.startsWith('fruit_')) {
      gameoverEl.classList.add('visible');
      window.removeEventListener('pointerdown', dropFruit);
    }
  });
});

window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w;
  canvas.height = h;
  render.options.width = w;
  render.options.height = h;
  Body.setPosition(render.bounds.max, { x: w, y: h });
});
