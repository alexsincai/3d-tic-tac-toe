
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(html, anchor = null) {
            this.e = element('div');
            this.a = anchor;
            this.u(html);
        }
        m(target, anchor = null) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(target, this.n[i], anchor);
            }
            this.t = target;
        }
        u(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        p(html) {
            this.d();
            this.u(html);
            this.m(this.t, this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.18.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    let cube = writable(
      Array(3)
        .fill()
        .map(_ =>
          Array(3)
            .fill()
            .map(_ =>
              Array(3)
                .fill()
                .map(_ => null),
            ),
        ),
    );

    let player = writable(0);

    const playerName = readable(["&nbsp;", "&times;", "&#9711;"]);

    const rotateX = cube =>
      cube.map((slice, z) =>
        slice.map((row, y) => row.map((_, x) => cube[z][y][x])),
      );

    const rotateY = cube =>
      cube.map((slice, z) =>
        slice.map((row, y) => row.map((_, x) => cube[z][x][y])),
      );

    const rotateZ = cube =>
      cube.map((slice, z) =>
        slice.map((row, y) => row.map((_, x) => cube[x][y][z])),
      );

    const checkRow = cube =>
      cube.some(slice =>
        slice.some(row =>
          row.every((cell, _, array) => cell === array[0] && array[0] !== null),
        ),
      );

    const checkX = cube => checkRow(rotateX(cube));
    const checkY = cube => checkRow(rotateY(cube));
    const checkZ = cube => checkRow(rotateZ(cube));
    const checkD = cube =>
      [
        [
          [cube[0][0][0], cube[0][1][1], cube[0][2][2]],
          [cube[0][0][2], cube[0][1][1], cube[0][2][0]],
        ],
        [
          [cube[1][0][0], cube[1][1][1], cube[1][2][2]],
          [cube[1][0][2], cube[1][1][1], cube[1][2][0]],
        ],
        [
          [cube[2][0][0], cube[2][1][1], cube[2][2][2]],
          [cube[2][0][2], cube[2][1][1], cube[2][2][0]],
        ],

        [
          [cube[0][0][0], cube[2][0][2], cube[2][0][2]],
          [cube[0][0][2], cube[2][0][2], cube[2][0][0]],
        ],
        [
          [cube[0][1][0], cube[2][1][2], cube[2][1][2]],
          [cube[0][1][2], cube[2][1][2], cube[2][1][0]],
        ],
        [
          [cube[0][2][0], cube[2][2][2], cube[2][2][2]],
          [cube[0][2][2], cube[2][2][2], cube[2][2][0]],
        ],

        [
          [cube[0][0][0], cube[1][1][0], cube[2][2][0]],
          [cube[0][2][0], cube[1][1][0], cube[2][0][0]],
        ],
        [
          [cube[0][0][1], cube[1][1][1], cube[2][2][1]],
          [cube[0][2][1], cube[1][1][1], cube[2][0][1]],
        ],
        [
          [cube[0][0][2], cube[1][1][2], cube[2][2][2]],
          [cube[0][2][2], cube[1][1][2], cube[2][0][2]],
        ],

        [
          [cube[0][0][0], cube[1][1][1], cube[2][2][2]],
          [cube[2][0][2], cube[1][1][1], cube[0][2][0]],
        ],
        [
          [cube[2][0][0], cube[1][1][1], cube[0][2][2]],
          [cube[0][0][2], cube[1][1][1], cube[2][2][0]],
        ],
      ].some(diag =>
        diag.some(option => option.every((c, i, a) => c === a[0] && a[0] !== null)),
      );

    const checker = cube => [
      checkX(cube),
      checkY(cube),
      checkZ(cube),
      checkD(cube),
    ];

    /* src/components/Square.svelte generated by Svelte v3.18.2 */
    const file = "src/components/Square.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (34:4) {#each row as cell, cellIndex}
    function create_each_block_1(ctx) {
    	let button;
    	let html_tag;
    	let raw_value = /*showCell*/ ctx[1](/*cellIndex*/ ctx[13], /*rowIndex*/ ctx[10]) + "";
    	let t;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[7](/*cellIndex*/ ctx[13], /*rowIndex*/ ctx[10], ...args);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = space();
    			html_tag = new HtmlTag(raw_value, t);
    			attr_dev(button, "class", "svelte-8zrp0m");
    			add_location(button, file, 34, 6, 737);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			html_tag.m(button);
    			append_dev(button, t);
    			dispose = listen_dev(button, "click", prevent_default(click_handler), false, true, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*showCell*/ 2 && raw_value !== (raw_value = /*showCell*/ ctx[1](/*cellIndex*/ ctx[13], /*rowIndex*/ ctx[10]) + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(34:4) {#each row as cell, cellIndex}",
    		ctx
    	});

    	return block;
    }

    // (33:2) {#each $cube[z] as row, rowIndex}
    function create_each_block(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*row*/ ctx[8];
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*handleClick, showCell, $cube, z*/ 15) {
    				each_value_1 = /*row*/ ctx[8];
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(33:2) {#each $cube[z] as row, rowIndex}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let each_value = /*$cube*/ ctx[2][/*z*/ ctx[0]];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "svelte-8zrp0m");
    			add_location(div, file, 31, 0, 654);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$cube, z, handleClick, showCell*/ 15) {
    				each_value = /*$cube*/ ctx[2][/*z*/ ctx[0]];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $cube;
    	let $playerName;
    	let $player;
    	validate_store(cube, "cube");
    	component_subscribe($$self, cube, $$value => $$invalidate(2, $cube = $$value));
    	validate_store(playerName, "playerName");
    	component_subscribe($$self, playerName, $$value => $$invalidate(5, $playerName = $$value));
    	validate_store(player, "player");
    	component_subscribe($$self, player, $$value => $$invalidate(6, $player = $$value));
    	let { z } = $$props;
    	let { allow } = $$props;

    	const handleClick = (x, y) => {
    		if ($cube[z][y][x] === null && allow) {
    			set_store_value(cube, $cube[z][y][x] = $player, $cube);
    			set_store_value(player, $player = ($player + 1) % 2);
    		}
    	};

    	const writable_props = ["z", "allow"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Square> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (cellIndex, rowIndex, e) => handleClick(cellIndex, rowIndex);

    	$$self.$set = $$props => {
    		if ("z" in $$props) $$invalidate(0, z = $$props.z);
    		if ("allow" in $$props) $$invalidate(4, allow = $$props.allow);
    	};

    	$$self.$capture_state = () => {
    		return {
    			z,
    			allow,
    			showCell,
    			$cube,
    			$playerName,
    			$player
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("z" in $$props) $$invalidate(0, z = $$props.z);
    		if ("allow" in $$props) $$invalidate(4, allow = $$props.allow);
    		if ("showCell" in $$props) $$invalidate(1, showCell = $$props.showCell);
    		if ("$cube" in $$props) cube.set($cube = $$props.$cube);
    		if ("$playerName" in $$props) playerName.set($playerName = $$props.$playerName);
    		if ("$player" in $$props) player.set($player = $$props.$player);
    	};

    	let showCell;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$cube, z, $playerName*/ 37) {
    			 $$invalidate(1, showCell = (x, y) => {
    				let cell = $cube[z][y][x];
    				if (cell === null) return $playerName[0];
    				return $playerName[cell + 1];
    			});
    		}
    	};

    	return [z, showCell, $cube, handleClick, allow, $playerName, $player, click_handler];
    }

    class Square extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { z: 0, allow: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Square",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*z*/ ctx[0] === undefined && !("z" in props)) {
    			console.warn("<Square> was created without expected prop 'z'");
    		}

    		if (/*allow*/ ctx[4] === undefined && !("allow" in props)) {
    			console.warn("<Square> was created without expected prop 'allow'");
    		}
    	}

    	get z() {
    		throw new Error("<Square>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set z(value) {
    		throw new Error("<Square>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get allow() {
    		throw new Error("<Square>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set allow(value) {
    		throw new Error("<Square>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Cube.svelte generated by Svelte v3.18.2 */
    const file$1 = "src/components/Cube.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    // (39:0) {#each $cube as square, squareIndex}
    function create_each_block$1(ctx) {
    	let current;

    	const square = new Square({
    			props: {
    				z: /*squareIndex*/ ctx[8],
    				allow: !/*gameWon*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(square.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(square, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const square_changes = {};
    			if (dirty & /*gameWon*/ 1) square_changes.allow = !/*gameWon*/ ctx[0];
    			square.$set(square_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(square.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(square.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(square, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(39:0) {#each $cube as square, squareIndex}",
    		ctx
    	});

    	return block;
    }

    // (43:0) {#if gameWon}
    function create_if_block(ctx) {
    	let div;
    	let h2;
    	let html_tag;
    	let t0;
    	let t1;
    	let p;
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			t0 = text("\n      has won!");
    			t1 = space();
    			p = element("p");
    			button = element("button");
    			button.textContent = "Play again?";
    			html_tag = new HtmlTag(/*showPlayer*/ ctx[2], t0);
    			attr_dev(h2, "class", "svelte-pfxvyp");
    			add_location(h2, file$1, 44, 4, 890);
    			add_location(button, file$1, 49, 6, 959);
    			add_location(p, file$1, 48, 4, 949);
    			attr_dev(div, "class", "svelte-pfxvyp");
    			add_location(div, file$1, 43, 2, 880);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			html_tag.m(h2);
    			append_dev(h2, t0);
    			append_dev(div, t1);
    			append_dev(div, p);
    			append_dev(p, button);
    			dispose = listen_dev(button, "click", prevent_default(/*reset*/ ctx[3]), false, true, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*showPlayer*/ 4) html_tag.p(/*showPlayer*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(43:0) {#if gameWon}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let t;
    	let if_block_anchor;
    	let current;
    	let each_value = /*$cube*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block = /*gameWon*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*gameWon, $cube*/ 3) {
    				each_value = /*$cube*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(t.parentNode, t);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*gameWon*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $cube;
    	let $playerName;
    	let $player;
    	validate_store(cube, "cube");
    	component_subscribe($$self, cube, $$value => $$invalidate(1, $cube = $$value));
    	validate_store(playerName, "playerName");
    	component_subscribe($$self, playerName, $$value => $$invalidate(4, $playerName = $$value));
    	validate_store(player, "player");
    	component_subscribe($$self, player, $$value => $$invalidate(5, $player = $$value));

    	const reset = () => {
    		set_store_value(cube, $cube = Array(3).fill().map(_ => Array(3).fill().map(_ => Array(3).fill().map(_ => null))));
    		set_store_value(player, $player = 0);
    	};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("gameWon" in $$props) $$invalidate(0, gameWon = $$props.gameWon);
    		if ("$cube" in $$props) cube.set($cube = $$props.$cube);
    		if ("showPlayer" in $$props) $$invalidate(2, showPlayer = $$props.showPlayer);
    		if ("$playerName" in $$props) playerName.set($playerName = $$props.$playerName);
    		if ("$player" in $$props) player.set($player = $$props.$player);
    	};

    	let gameWon;
    	let showPlayer;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$cube*/ 2) {
    			 $$invalidate(0, gameWon = checker($cube).some(x => x));
    		}

    		if ($$self.$$.dirty & /*gameWon, $playerName, $player*/ 49) {
    			 $$invalidate(2, showPlayer = gameWon && $playerName[($player + 1) % 2 + 1]);
    		}
    	};

    	return [gameWon, $cube, showPlayer, reset];
    }

    class Cube extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cube",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/components/Board.svelte generated by Svelte v3.18.2 */

    function create_fragment$2(ctx) {
    	let current;
    	const cube = new Cube({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(cube.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(cube, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cube.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cube.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cube, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Board extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Board",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    const board = new Board({
      target: document.body,
    });

    window.board = board;

    return board;

}());
