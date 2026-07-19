import { useState, useEffect } from 'react'
import './App.css'

const scripts = [
  {
    id: 1,
    name: 'AutoSpammer Pro',
    category: 'Automation',
    description: 'Advanced text automation with variable delays, jitter randomization, and anti-detection patterns. Built this one late at night when I needed reliable spam without getting rate-limited.',
    code: `class AutoSpammer {
  constructor(messages, options = {}) {
    this.messages = messages;
    this.minDelay = options.minDelay || 1000;
    this.maxDelay = options.maxDelay || 3000;
    this.jitter = options.jitter || 0.2;
    this.running = false;
    this.stats = { sent: 0, errors: 0 };
  }

  getDelay() {
    const base = Math.random() * (this.maxDelay - this.minDelay)
                 + this.minDelay;
    const jitterAmt = base * this.jitter;
    return base + (Math.random() * jitterAmt * 2 - jitterAmt);
  }

  randomMessage() {
    const idx = Math.floor(Math.random() * this.messages.length);
    return this.messages[idx].replace('{ts}', Date.now());
  }

  async start() {
    this.running = true;
    while (this.running) {
      try {
        await this.send(this.randomMessage());
        this.stats.sent++;
      } catch (e) {
        this.stats.errors++;
      }
      await new Promise(r => setTimeout(r, this.getDelay()));
    }
  }

  stop() {
    this.running = false;
    return this.stats;
  }
}`,
    filename: 'autoSpammer.js',
    lines: 42,
    tags: ['async/await', 'class-based', 'randomization'],
  },
  {
    id: 2,
    name: 'Packet Interceptor',
    category: 'Network',
    description: 'Hooks into the plugin network layer, captures packets, runs them through filters, and can modify payloads on the fly. Took me a while to figure out the buffer parsing.',
    code: `class PacketInterceptor {
  constructor(adapter) {
    this.adapter = adapter;
    this.filters = new Map();
    this.handlers = new Map();
    this.buffer = [];
    this.maxBuffer = 1000;
  }

  addFilter(name, predicate) {
    this.filters.set(name, predicate);
    return this;
  }

  onPacket(type, handler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type).push(handler);
    return this;
  }

  async intercept(rawPacket) {
    const packet = this.parse(rawPacket);

    for (const [name, filter] of this.filters) {
      if (!filter(packet)) {
        return { action: 'DROP', reason: name };
      }
    }

    const handlers = this.handlers.get(packet.type) || [];
    let modified = { ...packet };

    for (const handler of handlers) {
      modified = await handler(modified) || modified;
    }

    this.buffer.push({
      timestamp: Date.now(),
      original: packet,
      modified
    });

    if (this.buffer.length > this.maxBuffer) {
      this.buffer.shift();
    }

    return { action: 'FORWARD', packet: modified };
  }

  parse(raw) {
    return {
      type: raw[0],
      id: raw.readUInt32BE(1),
      payload: raw.slice(5),
      checksum: raw.readUInt16BE(raw.length - 2)
    };
  }
}`,
    filename: 'packetInterceptor.js',
    lines: 64,
    tags: ['buffer parsing', 'chain pattern', 'event-driven'],
  },
  {
    id: 3,
    name: 'Script Obfuscator',
    category: 'Security',
    description: 'Multi-layer obfuscation engine. Renames variables, encrypts strings, injects dead code, and scrambles control flow. I use this to protect every script before release.',
    code: `class ScriptObfuscator {
  constructor(options = {}) {
    this.layers = options.layers || 3;
    this.encoding = options.encoding || 'base64';
    this.deadCodeRatio = options.deadCode || 0.15;
    this.stringEncryption = true;
  }

  obfuscate(source) {
    let result = source;
    for (let i = 0; i < this.layers; i++) {
      result = this.applyLayer(result, i);
    }
    return this.wrap(result);
  }

  applyLayer(code, layerIndex) {
    code = this.renameIdentifiers(code);
    code = this.encryptStrings(code);
    code = this.insertDeadCode(code);
    if (layerIndex > 0) {
      code = this.addControlFlow(code);
    }
    return code;
  }

  renameIdentifiers(code) {
    const map = new Map();
    let counter = 0;
    return code.replace(/\\b([a-zA-Z_$][\\w$]*)\\b/g, (match) => {
      if (this.isReserved(match)) return match;
      if (!map.has(match)) {
        map.set(match, '_0x' + (counter++).toString(16).padStart(4, '0'));
      }
      return map.get(match);
    });
  }

  encryptStrings(code) {
    return code.replace(/(["'])(?:(?!\\1).)*?\\1/g, (str) => {
      const encoded = Buffer.from(str.slice(1, -1))
        .toString(this.encoding);
      return \`atob('\${encoded}')\`;
    });
  }

  insertDeadCode(code) {
    const lines = code.split('\\n');
    const count = Math.floor(lines.length * this.deadCodeRatio);
    for (let i = 0; i < count; i++) {
      const pos = Math.floor(Math.random() * lines.length);
      lines.splice(pos, 0, this.generateDeadCode());
    }
    return lines.join('\\n');
  }

  generateDeadCode() {
    const templates = [
      'if(false){const _=void 0;}',
      '/*' + Math.random().toString(36) + '*/',
      'void(0&&console.log());'
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  wrap(code) {
    return \`(function(){\\n\${code}\\n})();\`;
  }
}`,
    filename: 'obfuscator.js',
    lines: 78,
    tags: ['regex', 'encryption', 'code generation'],
  },
  {
    id: 4,
    name: 'Event Hooker',
    category: 'System',
    description: 'Low-level event hooker with priority queues and wildcard matching. I built this after getting frustrated with limited event APIs in plugin environments.',
    code: `class EventHooker {
  constructor() {
    this.hooks = new Map();
    this.intercepted = 0;
    this.redirected = 0;
  }

  hook(eventName, callback, priority = 0) {
    if (!this.hooks.has(eventName)) {
      this.hooks.set(eventName, []);
    }

    const entry = {
      callback,
      priority,
      id: crypto.randomUUID()
    };

    this.hooks.get(eventName).push(entry);
    this.hooks.get(eventName)
      .sort((a, b) => b.priority - a.priority);

    return () => this.unhook(eventName, entry.id);
  }

  unhook(eventName, id) {
    const hooks = this.hooks.get(eventName);
    if (!hooks) return false;
    const idx = hooks.findIndex(h => h.id === id);
    if (idx !== -1) {
      hooks.splice(idx, 1);
      return true;
    }
    return false;
  }

  async emit(eventName, data) {
    this.intercepted++;
    const hooks = this.getMatchingHooks(eventName);
    let result = { ...data, _stopped: false };

    for (const { callback } of hooks) {
      if (result._stopped) break;
      const output = await callback(result);
      if (output === null) {
        result._stopped = true;
        break;
      }
      result = { ...result, ...output };
    }
    return result;
  }

  getMatchingHooks(eventName) {
    const exact = this.hooks.get(eventName) || [];
    const wildcard = this.hooks.get('*') || [];
    const prefix = this.hooks.get(
      eventName.split('.')[0] + '.*'
    ) || [];
    return [...exact, ...prefix, ...wildcard]
      .sort((a, b) => b.priority - a.priority);
  }

  redirect(from, to) {
    this.redirected++;
    return this.hook(from, async (data) => {
      await this.emit(to, data);
      return null;
    }, 999);
  }
}`,
    filename: 'eventHooker.js',
    lines: 72,
    tags: ['Map', 'async events', 'wildcards'],
  },
  {
    id: 5,
    name: 'Cache Engine',
    category: 'Performance',
    description: 'LRU cache with TTL expiry, optional compression, and stats tracking. I wrote this to cache API responses in a plugin that was hitting rate limits.',
    code: `class CacheEngine {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 10000;
    this.defaultTTL = options.ttl || 300000;
    this.store = new Map();
    this.timers = new Map();
    this.accessOrder = [];
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0
    };
  }

  set(key, value, ttl) {
    if (this.store.has(key)) this.remove(key);

    this.store.set(key, {
      value,
      created: Date.now(),
      ttl: ttl || this.defaultTTL,
      size: JSON.stringify(value).length
    });

    this.accessOrder.push(key);
    this.evict();

    const timer = setTimeout(
      () => this.remove(key),
      ttl || this.defaultTTL
    );
    this.timers.set(key, timer);
  }

  get(key) {
    const entry = this.store.get(key);

    if (!entry) {
      this.stats.misses++;
      return undefined;
    }

    if (Date.now() - entry.created > entry.ttl) {
      this.remove(key);
      this.stats.misses++;
      return undefined;
    }

    this.stats.hits++;
    this.touch(key);
    return entry.value;
  }

  touch(key) {
    const idx = this.accessOrder.indexOf(key);
    if (idx !== -1) this.accessOrder.splice(idx, 1);
    this.accessOrder.push(key);
  }

  evict() {
    while (this.accessOrder.length > this.maxSize) {
      const oldest = this.accessOrder.shift();
      this.remove(oldest);
      this.stats.evictions++;
    }
  }

  remove(key) {
    this.store.delete(key);
    this.accessOrder = this.accessOrder.filter(k => k !== key);
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
  }

  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: total
        ? (this.stats.hits / total * 100).toFixed(1) + '%'
        : '0%',
      memory: [...this.store.values()]
        .reduce((a, b) => a + b.size, 0)
    };
  }
}`,
    filename: 'cacheEngine.js',
    lines: 88,
    tags: ['LRU', 'TTL', 'Map'],
  },
  {
    id: 6,
    name: 'Command Router',
    category: 'Framework',
    description: 'Full command framework with arg parsing, permission levels, cooldowns, and middleware. This is the backbone of every plugin command system I ship.',
    code: `class CommandRouter {
  constructor() {
    this.commands = new Map();
    this.middlewares = [];
    this.cooldowns = new Map();
  }

  command(name, config) {
    this.commands.set(name, {
      name,
      description: config.description || '',
      usage: config.usage || '',
      permission: config.permission || 'user',
      cooldown: config.cooldown || 0,
      aliases: config.aliases || [],
      execute: config.execute
    });

    for (const alias of config.aliases || []) {
      this.commands.set(alias, this.commands.get(name));
    }
    return this;
  }

  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }

  async route(input, context) {
    const parsed = this.parse(input);
    const cmd = this.commands.get(parsed.command);

    if (!cmd) {
      return {
        success: false,
        error: 'Unknown command: ' + parsed.command
      };
    }

    for (const mw of this.middlewares) {
      const result = await mw(parsed, context, cmd);
      if (result === false) {
        return { success: false, error: 'Blocked' };
      }
    }

    const userPerm = context.permission || 'user';
    if (!this.hasPermission(userPerm, cmd.permission)) {
      return { success: false, error: 'No permission' };
    }

    const cdKey = context.userId + ':' + cmd.name;
    if (this.isOnCooldown(cdKey)) {
      const rem = this.getCooldownRemaining(cdKey);
      return {
        success: false,
        error: 'Wait ' + rem + 's'
      };
    }

    try {
      this.setCooldown(cdKey, cmd.cooldown);
      const result = await cmd.execute(parsed.args, context);
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  parse(input) {
    const parts = input.trim().split(/\\s+/);
    const command = parts[0]
      ?.toLowerCase().replace(/[\\/!]/, '') || '';
    const args = parts.slice(1);
    const flags = {};

    for (let i = 0; i < args.length; i++) {
      if (args[i].startsWith('--')) {
        const key = args[i].slice(2);
        const next = args[i + 1];
        if (next && !next.startsWith('--')) {
          flags[key] = next;
          args.splice(i, 2);
          i--;
        } else {
          flags[key] = true;
        }
      }
    }
    return { command, args, flags };
  }

  hasPermission(userLevel, required) {
    const levels = ['guest','user','mod','admin','owner'];
    return levels.indexOf(userLevel) >= levels.indexOf(required);
  }

  isOnCooldown(key) {
    const cd = this.cooldowns.get(key);
    return cd && Date.now() < cd;
  }

  getCooldownRemaining(key) {
    return Math.ceil(
      (this.cooldowns.get(key) - Date.now()) / 1000
    );
  }

  setCooldown(key, duration) {
    if (duration > 0) {
      this.cooldowns.set(key, Date.now() + duration * 1000);
    }
  }
}`,
    filename: 'commandRouter.js',
    lines: 112,
    tags: ['middleware', 'arg parsing', 'permissions'],
  },
]

const categories = ['All', ...new Set(scripts.map(s => s.category))]

/* ── hooks ── */

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible')
        })
      },
      { threshold: 0.1 }
    )
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

function useTypingEffect(text, speed = 50, delay = 1200) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    let interval
    const timeout = setTimeout(() => {
      let i = 0
      interval = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1))
          i++
        } else {
          clearInterval(interval)
          setDone(true)
        }
      }, speed)
    }, delay)
    return () => { clearTimeout(timeout); clearInterval(interval) }
  }, [text, speed, delay])

  return { displayed, done }
}

function useSkillBarAnimation() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.skill-fill').forEach((fill) => {
              fill.style.width = fill.dataset.width
            })
          }
        })
      },
      { threshold: 0.3 }
    )
    const el = document.querySelector('.skills-grid')
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [])
}

function useCursor() {
  useEffect(() => {
    const dot = document.querySelector('.cursor-dot')
    const ring = document.querySelector('.cursor-ring')
    if (!dot || !ring) return

    let mx = 0, my = 0, rx = 0, ry = 0

    const onMove = (e) => {
      mx = e.clientX; my = e.clientY
      dot.style.left = mx - 3 + 'px'
      dot.style.top = my - 3 + 'px'
    }

    const loop = () => {
      rx += (mx - rx) * 0.15
      ry += (my - ry) * 0.15
      ring.style.left = rx - 16 + 'px'
      ring.style.top = ry - 16 + 'px'
      requestAnimationFrame(loop)
    }

    document.addEventListener('mousemove', onMove)
    const raf = requestAnimationFrame(loop)

    const onEnter = () => ring.classList.add('hovering')
    const onLeave = () => ring.classList.remove('hovering')
    const els = document.querySelectorAll('button, a, input, .script-card')
    els.forEach((el) => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    return () => {
      document.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
      els.forEach((el) => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
      })
    }
  }, [])
}

/* ── components ── */

function CodeViewer({ code, filename }) {
  const [copied, setCopied] = useState(false)

  const copy = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="code-viewer">
      <div className="code-top">
        <div className="code-dots">
          <span /><span /><span />
        </div>
        <span className="code-filename">{filename}</span>
        <button className="copy-btn" onClick={copy}>
          {copied ? 'copied' : 'copy'}
        </button>
      </div>
      <div className="code-body">
        <pre><code>{code}</code></pre>
      </div>
    </div>
  )
}

function ScriptCard({ script }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className={`script-card ${open ? 'open' : ''}`}
      onClick={() => setOpen(!open)}
    >
      <div className="card-row">
        <div className="card-info">
          <div className="card-title">{script.name}</div>
          <div className="card-meta">
            <span className="card-category">{script.category}</span>
            <span className="dot" />
            <span>{script.lines} lines</span>
            <span className="dot" />
            <span>{script.tags[0]}</span>
          </div>
        </div>
        <span className="card-chevron">{open ? 'v' : '>'}</span>
      </div>

      <div className={`card-expanded ${open ? 'open' : ''}`}>
        <div className="card-expanded-inner">
          <p className="card-desc">{script.description}</p>
          <div className="card-tags">
            {script.tags.map((tag) => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
          <CodeViewer code={script.code} filename={script.filename} />
        </div>
      </div>
    </div>
  )
}

function SkillBar({ name, level }) {
  return (
    <div className="skill-item">
      <div className="skill-top">
        <span className="skill-name">{name}</span>
        <span className="skill-pct">{level}%</span>
      </div>
      <div className="skill-track">
        <div className="skill-fill" data-width={level + '%'} />
      </div>
    </div>
  )
}

/* ── app ── */

function App() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const tagline = useTypingEffect(
    'I write JS scripts that do things plugin APIs wish they could handle.',
    30, 800
  )

  useScrollReveal()
  useSkillBarAnimation()
  useCursor()

  const filtered = scripts.filter((s) => {
    const matchCat = activeCategory === 'All' || s.category === activeCategory
    const matchSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchCat && matchSearch
  })

  const totalLines = scripts.reduce((a, s) => a + s.lines, 0)

  return (
    <div className="portfolio">
      <div className="cursor-dot" />
      <div className="cursor-ring" />

      <header className="hero">
        <span className="hero-line">plugin scripter</span>
        <h1 className="hero-name">
          FlankieXD<span className="thin"> / Zev</span>
        </h1>
        <p className="hero-tagline">
          {tagline.displayed}
          {!tagline.done && <span className="cursor-blink" />}
        </p>
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-num">5</span>
            <span className="stat-label">Years</span>
          </div>
          <div className="stat">
            <span className="stat-num">{scripts.length}</span>
            <span className="stat-label">Scripts</span>
          </div>
          <div className="stat">
            <span className="stat-num">{totalLines}+</span>
            <span className="stat-label">Lines</span>
          </div>
          <div className="stat">
            <span className="stat-num">{categories.length - 1}</span>
            <span className="stat-label">Categories</span>
          </div>
        </div>
        <div className="hero-scroll">
          <div className="scroll-line" />
        </div>
      </header>

      <section className="skills-section">
        <div className="section-header reveal">
          <span className="section-num">01</span>
          <h2 className="section-title">Skills</h2>
          <div className="section-line" />
        </div>
        <div className="skills-grid">
          <SkillBar name="JavaScript" level={95} />
          <SkillBar name="Node.js" level={88} />
          <SkillBar name="Async Patterns" level={90} />
          <SkillBar name="Plugin Dev" level={92} />
          <SkillBar name="Network / API" level={85} />
          <SkillBar name="Security" level={80} />
          <SkillBar name="Performance" level={82} />
          <SkillBar name="System Integration" level={78} />
        </div>
      </section>

      <section className="scripts-section">
        <div className="section-header reveal">
          <span className="section-num">02</span>
          <h2 className="section-title">Scripts</h2>
          <div className="section-line" />
        </div>

        <div className="controls reveal">
          <div className="search-box">
            <span className="search-icon">{'>'}</span>
            <input
              type="text"
              placeholder="search scripts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="category-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`tab ${activeCategory === cat ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setActiveCategory(cat) }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="scripts-list">
          {filtered.map((script) => (
            <ScriptCard key={script.id} script={script} />
          ))}
          {filtered.length === 0 && (
            <p className="no-results">nothing here. try a different search.</p>
          )}
        </div>
      </section>

      <footer className="footer">
        <p className="footer-text">
          built by <span className="accent">FlankieXD</span> — 5 years of making plugins do cool stuff
        </p>
      </footer>
    </div>
  )
}

export default App
