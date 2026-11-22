// Generic "type or pick" combobox used by the time zone and GPU fields.
(function (g) {
  'use strict';

  // options:
  //   input, toggle, list, root       DOM elements
  //   getSelected()                   value of the currently selected item (highlighted in the list)
  //   alias(item) -> string           optional secondary text (re-evaluated by refresh())
  //   emptyText() -> string           text shown when nothing matches
  //   bestMatch                       when true, Enter on a partial query picks the shortest matching label
  //   customLabel(text) -> string     if set, a "use what I typed" row is offered when nothing matches exactly
  //   onType(text)                    called on every keystroke
  //   onChoose(item)                  an item (or the custom row, item.custom === true) was chosen
  //   onCommit(text)                  Enter pressed with no item to choose
  //   onBlur(text)                    input lost focus
  // items: [{ value, label, group, meta, search }]
  function makeCombo(o) {
    const { root, input, toggle, list } = o;
    const st = { items: [], groups: [], visible: [], active: -1, open: false, customItem: null };

    const emptyEl = document.createElement('div');
    emptyEl.className = 'combo-empty';
    emptyEl.hidden = true;

    function span(cls, text) {
      const s = document.createElement('span');
      s.className = cls;
      if (text) s.textContent = text;
      return s;
    }

    function setItems(items) {
      st.items = [];
      st.groups = [];
      st.customItem = null;
      list.textContent = '';
      list.appendChild(emptyEl);

      if (o.customLabel) {
        const el = document.createElement('div');
        el.className = 'combo-item combo-custom';
        el.setAttribute('role', 'option');
        el.hidden = true;
        st.customItem = { custom: true, el, value: '', label: '' };
        el._item = st.customItem;
        list.appendChild(el);
      }

      let current;
      let group = null;
      for (const src of items) {
        if (group === null || src.group !== current) {
          current = src.group;
          const header = document.createElement('div');
          header.className = 'combo-group';
          header.textContent = src.group || '';
          list.appendChild(header);
          group = { el: header, items: [] };
          st.groups.push(group);
        }
        const it = Object.assign({}, src);
        it.search = (it.search || (it.label + ' ' + it.value)).toLowerCase();
        const el = document.createElement('div');
        el.className = 'combo-item';
        el.setAttribute('role', 'option');
        el.dataset.name = it.value;
        el.dataset.label = it.label;
        it.aliasEl = span('tz-alias');
        el.append(span('tz-name', it.label), it.aliasEl, span('tz-offset', it.meta));
        el._item = it;
        it.el = el;
        list.appendChild(el);
        st.items.push(it);
        group.items.push(it);
      }
      refresh();
    }

    function refresh() {
      for (const it of st.items) it.aliasEl.textContent = o.alias ? o.alias(it) || '' : '';
      emptyEl.textContent = o.emptyText ? o.emptyText() : '';
      if (st.open) filter(input.value);
    }

    function setActive(index, scroll) {
      st.active = index;
      st.visible.forEach((it, i) => it.el.classList.toggle('active', i === index));
      const cur = st.visible[index];
      if (cur && scroll) cur.el.scrollIntoView({ block: 'nearest' });
    }

    function filter(query) {
      const q = query.trim().toLowerCase();
      const selected = o.getSelected ? o.getSelected() : '';
      st.visible = [];
      for (const it of st.items) {
        const show = !q || it.search.includes(q);
        it.el.hidden = !show;
        it.el.classList.toggle('selected', it.value === selected);
        if (show) st.visible.push(it);
      }
      for (const grp of st.groups) grp.el.hidden = !grp.items.some((i) => !i.el.hidden);

      const exact = q && st.visible.some((i) => i.label.toLowerCase() === q || String(i.value).toLowerCase() === q);
      if (st.customItem) {
        const c = st.customItem;
        const showCustom = !!q && !exact;
        c.value = query.trim();
        c.el.hidden = !showCustom;
        if (showCustom) {
          c.el.textContent = o.customLabel(c.value);
          st.visible.unshift(c);
        }
      }
      emptyEl.hidden = st.visible.length > 0;

      let idx = st.visible.findIndex((i) => !i.custom && (i.label.toLowerCase() === q || String(i.value).toLowerCase() === q));
      if (idx < 0 && !q) idx = st.visible.findIndex((i) => i.value === selected);
      if (idx < 0 && q && o.bestMatch) {
        // Closest name = the shortest label that still contains the query ("rtx 4060" -> RTX 4060, not 4060 Ti).
        let best = -1;
        st.visible.forEach((i, n) => {
          if (!i.custom && (best < 0 || i.label.length < st.visible[best].label.length)) best = n;
        });
        idx = best;
      }
      if (idx < 0) idx = st.visible.findIndex((i) => !i.custom);
      if (idx < 0 && st.visible.length) idx = 0;
      setActive(idx, true);
    }

    function open(showAll) {
      if (!st.open) {
        st.open = true;
        list.hidden = false;
        input.setAttribute('aria-expanded', 'true');
      }
      filter(showAll ? '' : input.value);
      list.scrollIntoView({ block: 'nearest' });
    }

    function close() {
      if (!st.open) return;
      st.open = false;
      list.hidden = true;
      input.setAttribute('aria-expanded', 'false');
    }

    function choose(item) {
      close();
      if (o.onChoose) o.onChoose(item);
    }

    input.addEventListener('focus', () => {
      input.select();
      open(true);
    });
    input.addEventListener('click', () => {
      if (!st.open) open(true);
    });
    input.addEventListener('input', () => {
      if (o.onType) o.onType(input.value);
      open(false);
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!st.open) {
          open(true);
          return;
        }
        if (!st.visible.length) return;
        const step = e.key === 'ArrowDown' ? 1 : -1;
        setActive((st.active + step + st.visible.length) % st.visible.length, true);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (st.open && st.visible[st.active]) {
          choose(st.visible[st.active]);
        } else {
          close();
          if (o.onCommit) o.onCommit(input.value.trim());
        }
      } else if (e.key === 'Escape') {
        if (st.open) {
          e.preventDefault();
          close();
        }
      } else if (e.key === 'Tab') {
        close();
      }
    });
    input.addEventListener('blur', () => {
      if (o.onBlur) o.onBlur(input.value);
    });

    toggle.addEventListener('click', () => {
      if (st.open) {
        close();
      } else {
        input.focus();
        open(true);
      }
    });

    // Keep focus in the input while interacting with the list.
    list.addEventListener('mousedown', (e) => e.preventDefault());
    list.addEventListener('click', (e) => {
      const el = e.target.closest('.combo-item');
      if (el && el._item) choose(el._item);
    });
    list.addEventListener('mousemove', (e) => {
      const el = e.target.closest('.combo-item');
      if (!el) return;
      const idx = st.visible.findIndex((i) => i.el === el);
      if (idx >= 0 && idx !== st.active) setActive(idx, false);
    });
    document.addEventListener('mousedown', (e) => {
      if (!root.contains(e.target)) close();
    });

    return { setItems, refresh, open, close, isOpen: () => st.open };
  }

  g.makeCombo = makeCombo;
})(window);
