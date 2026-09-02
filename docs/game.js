/* Garage Rush – a mobile game built on the Builder pattern from the Java lab.
 * Part / Tires / Exhaust / Car / CarBuilder mirror the Java classes;
 * the game wraps them in customer orders, a timer and scoring. */
(() => {
  'use strict';

  // ---------- Builder pattern model (mirrors Java/ sources) ----------

  class Part {
    constructor(id, name, price, attrs = {}) {
      this.id = id;
      this._name = name;
      this._price = price;
      this.attrs = attrs;
    }
    name() { return this._name; }
    price() { return this._price; }
    get category() { return 'part'; }
  }

  class Tires extends Part { get category() { return 'tires'; } }
  class Exhaust extends Part { get category() { return 'exhaust'; } }
  class Engine extends Part { get category() { return 'engine'; } }

  class Car {
    constructor() { this.parts = []; }
    addPart(part) { this.parts.push(part); return this; }
    getCost() { return this.parts.reduce((sum, p) => sum + p.price(), 0); }
    showParts() { return this.parts.map(p => ({ name: p.name(), price: p.price() })); }
    partOf(category) { return this.parts.find(p => p.category === category) || null; }
    get performance() { return this.parts.reduce((s, p) => s + (p.attrs.perf || 0), 0); }
  }

  class CarBuilder {
    constructor() { this.reset(); }
    reset() { this.tires = null; this.exhaust = null; this.engine = null; return this; }
    withTires(t) { this.tires = t; return this; }
    withExhaust(e) { this.exhaust = e; return this; }
    withEngine(e) { this.engine = e; return this; }
    isComplete() { return !!(this.tires && this.exhaust && this.engine); }
    build() {
      const car = new Car();
      if (this.tires) car.addPart(this.tires);
      if (this.exhaust) car.addPart(this.exhaust);
      if (this.engine) car.addPart(this.engine);
      return car;
    }
  }

  // ---------- Parts catalog ----------

  const CATALOG = {
    tires: [
      new Tires('summer', 'Summer Tire', 40.5, { season: 'summer', perf: 1, icon: '☀️', rim: '#9ca3af' }),
      new Tires('winter', 'Winter Tire', 50.5, { season: 'winter', perf: 1, icon: '❄️', rim: '#bae6fd' }),
      new Tires('allseason', 'All-Season Tire', 65, { season: 'any', perf: 0, icon: '🌦️', rim: '#86efac' }),
      new Tires('racing', 'Racing Slicks', 120, { season: 'summer', perf: 2, icon: '🏁', rim: '#f87171' }),
    ],
    exhaust: [
      new Exhaust('single', 'Single Exit Exhaust', 350, { noise: 'quiet', perf: 0, icon: '🔈', pipes: 1 }),
      new Exhaust('dual', 'Dual Exit Exhaust', 500, { noise: 'loud', perf: 1, icon: '🔊', pipes: 2 }),
      new Exhaust('whisper', 'Whisper Muffler', 280, { noise: 'quiet', perf: 0, icon: '🤫', pipes: 1 }),
      new Exhaust('sport', 'Sport Exhaust', 650, { noise: 'loud', perf: 2, icon: '🔥', pipes: 2 }),
    ],
    engine: [
      new Engine('eco', 'Eco Engine', 800, { perf: 0, eco: true, icon: '🌱', color: '#16a34a' }),
      new Engine('v6', 'V6 Engine', 1200, { perf: 1, icon: '⚙️', color: '#64748b' }),
      new Engine('v8', 'V8 Engine', 1800, { perf: 2, icon: '🐎', color: '#dc2626' }),
    ],
  };
  const CATEGORY_LABELS = { tires: 'Tires', exhaust: 'Exhaust', engine: 'Engine' };
  const CATEGORIES = ['tires', 'exhaust', 'engine'];

  // ---------- Orders ----------

  const EXTRAS = {
    none: { label: null, test: () => true },
    quiet: { label: 'Wants it quiet', test: car => car.partOf('exhaust').attrs.noise === 'quiet' },
    loud: { label: 'Wants it LOUD', test: car => car.partOf('exhaust').attrs.noise === 'loud' },
    fast: { label: 'Wants it fast (performance 4+)', test: car => car.performance >= 4 },
    eco: { label: 'Wants an eco engine', test: car => !!car.partOf('engine').attrs.eco },
  };

  const SEASON = {
    winter: { label: 'Winter roads', icon: '❄️', test: car => ['winter', 'any'].includes(car.partOf('tires').attrs.season) },
    summer: { label: 'Summer roads', icon: '☀️', test: car => ['summer', 'any'].includes(car.partOf('tires').attrs.season) },
  };

  const LINES = {
    winter: ['Snow is coming and I need a car that can handle it.', 'Ice everywhere out there. Set me up for winter.', 'Heading to the mountains this weekend!'],
    summer: ['Road trip season! Build me something for the sun.', 'It is hot out. Get me a summer ready ride.', 'Beach weekend. Make it happen.'],
  };
  const AVATARS = ['🧑', '👩', '👨', '🧔', '👵', '👴', '🧑‍🦱', '👩‍🦰', '🧑‍🦳', '👷', '🕵️', '🧑‍🎤'];

  const rand = arr => arr[Math.floor(Math.random() * arr.length)];

  function allCombos() {
    const out = [];
    for (const t of CATALOG.tires) for (const e of CATALOG.exhaust) for (const g of CATALOG.engine) {
      out.push(new CarBuilder().withTires(t).withExhaust(e).withEngine(g).build());
    }
    return out;
  }
  const COMBOS = allCombos();

  function makeOrder(orderNumber) {
    const season = rand(['winter', 'summer']);
    // Special requests become more common as the shift goes on.
    const extraChance = Math.min(0.85, 0.25 + orderNumber * 0.07);
    const extraKey = Math.random() < extraChance ? rand(['quiet', 'loud', 'fast', 'eco']) : 'none';
    const extra = EXTRAS[extraKey];
    const valid = COMBOS.filter(c => SEASON[season].test(c) && extra.test(c));
    // Budget is anchored to a real valid build so every order is solvable,
    // with less slack as the game progresses.
    const anchor = rand(valid);
    const slack = Math.max(0, 120 - orderNumber * 10) * Math.random();
    const budget = Math.ceil((anchor.getCost() + slack) / 10) * 10;
    return {
      season,
      extraKey,
      budget,
      avatar: rand(AVATARS),
      line: rand(LINES[season]),
      requirements: [
        { icon: SEASON[season].icon, text: SEASON[season].label },
        { icon: '💵', text: `Budget ${money(budget)}` },
        ...(extra.label ? [{ icon: '⭐', text: extra.label }] : []),
      ],
      timeLimit: Math.max(15, 33 - orderNumber),
    };
  }

  function evaluate(order, car) {
    const problems = [];
    if (!SEASON[order.season].test(car)) problems.push(`Wrong tires for ${order.season}`);
    if (!EXTRAS[order.extraKey].test(car)) problems.push(EXTRAS[order.extraKey].label.replace('Wants', 'Customer wanted'));
    if (car.getCost() > order.budget) problems.push(`Over budget by ${money(car.getCost() - order.budget)}`);
    return problems;
  }

  function money(n) {
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
  }

  // ---------- Game state ----------

  const BEST_KEY = 'garage-rush-best';
  const state = {
    score: 0, lives: 3, orderNumber: 0, streak: 0, delivered: 0,
    order: null, builder: new CarBuilder(),
    timeLeft: 0, timerId: null, lastTick: 0, locked: false,
  };

  const $ = id => document.getElementById(id);
  const el = {
    screens: { start: $('screen-start'), how: $('screen-how'), game: $('screen-game'), over: $('screen-over') },
    startBest: $('start-best'), startBestValue: $('start-best-value'),
    score: $('hud-score'), orderNo: $('hud-order'), lives: $('hud-lives'),
    timerBar: $('timer-bar'), customer: $('customer'), avatar: $('customer-avatar'),
    line: $('customer-line'), requirements: $('requirements'),
    parts: $('parts'), cost: $('car-cost'), budget: $('car-budget'),
    carBody: $('car-body'), carTires: $('car-tires'), carExhaust: $('car-exhaust'),
    carExhaust2: $('car-exhaust-2'), carEngine: $('car-engine'),
    deliver: $('btn-deliver'), reset: $('btn-reset'), toast: $('toast'),
    overScore: $('over-score'), overStats: $('over-stats'), overBest: $('over-best'),
  };

  function show(name) {
    Object.entries(el.screens).forEach(([k, s]) => s.classList.toggle('active', k === name));
  }

  function getBest() { return Number(localStorage.getItem(BEST_KEY) || 0); }

  function haptic(pattern) {
    if (navigator.vibrate) navigator.vibrate(pattern);
  }

  // ---------- Rendering ----------

  function renderHud() {
    el.score.textContent = state.score;
    el.orderNo.textContent = state.orderNumber;
    el.lives.innerHTML = Array.from({ length: 3 }, (_, i) =>
      `<span class="${i < state.lives ? 'life' : 'life lost'}">🔧</span>`).join('');
  }

  function renderCustomer() {
    const o = state.order;
    el.avatar.textContent = o.avatar;
    el.line.textContent = o.line;
    el.requirements.innerHTML = o.requirements
      .map(r => `<li><span class="req-icon">${r.icon}</span>${r.text}</li>`).join('');
    el.customer.classList.remove('enter');
    void el.customer.offsetWidth;
    el.customer.classList.add('enter');
  }

  function renderParts() {
    el.parts.innerHTML = CATEGORIES.map(cat => `
      <div class="part-group" data-category="${cat}">
        <h3 class="part-title">${CATEGORY_LABELS[cat]}</h3>
        <div class="part-grid">
          ${CATALOG[cat].map(p => `
            <button class="part" type="button" data-category="${cat}" data-id="${p.id}" aria-pressed="false">
              <span class="part-icon">${p.attrs.icon}</span>
              <span class="part-name">${p.name()}</span>
              <span class="part-price">${money(p.price())}</span>
            </button>`).join('')}
        </div>
      </div>`).join('');
  }

  function renderBuild() {
    const b = state.builder;
    const car = b.build();
    const cost = car.getCost();
    el.cost.textContent = money(cost);
    el.budget.textContent = `of ${money(state.order.budget)}`;
    el.cost.classList.toggle('over', cost > state.order.budget);

    el.parts.querySelectorAll('.part').forEach(btn => {
      const chosen = b[btn.dataset.category];
      const on = !!chosen && chosen.id === btn.dataset.id;
      btn.classList.toggle('selected', on);
      btn.setAttribute('aria-pressed', String(on));
    });
    CATEGORIES.forEach(cat => {
      el.parts.querySelector(`.part-group[data-category="${cat}"]`).classList.toggle('done', !!b[cat]);
    });

    el.carTires.classList.toggle('slot-empty', !b.tires);
    el.carTires.querySelectorAll('circle:nth-child(even)').forEach(c => c.setAttribute('fill', b.tires ? b.tires.attrs.rim : '#9ca3af'));
    el.carExhaust.classList.toggle('slot-empty', !b.exhaust);
    el.carExhaust2.setAttribute('opacity', b.exhaust && b.exhaust.attrs.pipes === 2 ? '1' : '0');
    el.carEngine.classList.toggle('slot-empty', !b.engine);
    el.carEngine.firstElementChild.setAttribute('fill', b.engine ? b.engine.attrs.color : '#374151');
    el.carBody.setAttribute('fill', b.isComplete() ? '#f97316' : '#94a3b8');

    el.deliver.disabled = !b.isComplete() || state.locked;
  }

  let toastTimer = null;
  function toast(msg, kind) {
    el.toast.textContent = msg;
    el.toast.className = `toast ${kind}`;
    el.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.toast.hidden = true; }, 1600);
  }

  // ---------- Timer ----------

  function startTimer() {
    stopTimer();
    state.timeLeft = state.order.timeLimit;
    state.lastTick = performance.now();
    el.timerBar.style.transition = 'none';
    el.timerBar.style.width = '100%';
    el.timerBar.classList.remove('low');
    state.timerId = requestAnimationFrame(tick);
  }

  function tick(now) {
    const dt = (now - state.lastTick) / 1000;
    state.lastTick = now;
    state.timeLeft = Math.max(0, state.timeLeft - dt);
    const pct = (state.timeLeft / state.order.timeLimit) * 100;
    el.timerBar.style.width = pct + '%';
    el.timerBar.classList.toggle('low', pct < 30);
    if (state.timeLeft <= 0) { fail('Too slow! The customer walked out.'); return; }
    state.timerId = requestAnimationFrame(tick);
  }

  function stopTimer() {
    if (state.timerId) cancelAnimationFrame(state.timerId);
    state.timerId = null;
  }

  // ---------- Flow ----------

  function startGame() {
    Object.assign(state, { score: 0, lives: 3, orderNumber: 0, streak: 0, delivered: 0, locked: false });
    renderParts();
    show('game');
    nextOrder();
  }

  function nextOrder() {
    state.orderNumber += 1;
    state.order = makeOrder(state.orderNumber);
    state.builder.reset();
    state.locked = false;
    renderHud();
    renderCustomer();
    renderBuild();
    startTimer();
  }

  function deliver() {
    if (state.locked || !state.builder.isComplete()) return;
    const car = state.builder.build();
    const problems = evaluate(state.order, car);
    if (problems.length) { fail(problems.join(' · ')); return; }

    stopTimer();
    state.locked = true;
    state.delivered += 1;
    state.streak += 1;
    const saved = state.order.budget - car.getCost();
    const points = 100 + Math.round(saved / 10) + Math.round(state.timeLeft * 4) + (state.streak >= 3 ? 50 : 0);
    state.score += points;
    renderHud();
    renderBuild();
    haptic(30);
    toast(`Delivered! +${points}${state.streak >= 3 ? ' (streak bonus)' : ''}`, 'good');
    el.customer.classList.add('happy');
    setTimeout(() => { el.customer.classList.remove('happy'); nextOrder(); }, 1100);
  }

  function fail(reason) {
    stopTimer();
    state.locked = true;
    state.streak = 0;
    state.lives -= 1;
    renderHud();
    renderBuild();
    haptic([60, 40, 60]);
    toast(reason, 'bad');
    el.customer.classList.add('angry');
    setTimeout(() => {
      el.customer.classList.remove('angry');
      if (state.lives <= 0) gameOver(); else nextOrder();
    }, 1400);
  }

  function gameOver() {
    stopTimer();
    const best = getBest();
    const isBest = state.score > best;
    if (isBest) localStorage.setItem(BEST_KEY, String(state.score));
    el.overScore.textContent = state.score;
    el.overStats.textContent = `${state.delivered} car${state.delivered === 1 ? '' : 's'} delivered · best ${Math.max(best, state.score)}`;
    el.overBest.hidden = !isBest;
    show('over');
  }

  function showStart() {
    const best = getBest();
    el.startBest.hidden = best === 0;
    el.startBestValue.textContent = best;
    show('start');
  }

  // ---------- Events ----------

  el.parts.addEventListener('click', e => {
    const btn = e.target.closest('.part');
    if (!btn || state.locked) return;
    const { category, id } = btn.dataset;
    const part = CATALOG[category].find(p => p.id === id);
    const b = state.builder;
    const current = b[category];
    const chosen = current && current.id === id ? null : part;
    if (category === 'tires') b.withTires(chosen);
    else if (category === 'exhaust') b.withExhaust(chosen);
    else b.withEngine(chosen);
    haptic(10);
    renderBuild();
  });

  el.reset.addEventListener('click', () => { if (!state.locked) { state.builder.reset(); renderBuild(); } });
  el.deliver.addEventListener('click', deliver);
  $('btn-start').addEventListener('click', startGame);
  $('btn-again').addEventListener('click', startGame);
  $('btn-home').addEventListener('click', showStart);
  $('btn-how').addEventListener('click', () => show('how'));
  $('btn-how-back').addEventListener('click', showStart);

  // Pause the clock when the tab is hidden so switching apps isn't a loss.
  document.addEventListener('visibilitychange', () => {
    if (!el.screens.game.classList.contains('active') || state.locked) return;
    if (document.hidden) stopTimer();
    else { state.lastTick = performance.now(); state.timerId = requestAnimationFrame(tick); }
  });

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  showStart();
})();
