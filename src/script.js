   (function () {
        const NMAX = 120,
          T = 800,
          H = 1 / 360,
          ZS = 0.0016,
          DPR = Math.min(window.devicePixelRatio || 1, 2);
        const $ = (id) => document.getElementById(id);

        /* ───────── settings (defaults) ───────── */
        const DEF = {
          spd: 1,
          Om: 3.16,
          dir: false,
          c: 0.02,
          L: 0.9,
          G: 9.81,
          Rx: 1,
          Ry: 0.5,
          spread: 1,
          n: 56,
          th0: 0,
          cspd: 1,
          rot: true,
          auto: true,
          zamp: 0.38,
          mode: "rainbow",
          c1: "#e86bb0",
          c2: "#4dd2ff",
          hue: 0,
          sat: 1,
          bri: 1,
          drift: 0,
          sel: 1,
          apply: "0",
          pcol: "#ffffff",
          bg: "#150a26",
          trails: true,
          tlen: 800,
          fade: 3.6,
          rods: true,
          rodOp: 0.7,
          bobs: true,
          bobSz: 2.6,
          glow: 0.55,
          pivs: false,
          pivSz: 1.6,
        };
        const S = Object.assign({}, DEF);

        /* ───────── control panel spec ───────── */
        const f1 = (v) => v.toFixed(1),
          f2 = (v) => v.toFixed(2),
          x1 = (v) => v.toFixed(1) + "×",
          pct = (v) => Math.round(v * 100) + "%";
        const SECS = [
          {
            id: "motion",
            title: "Motion",
            open: true,
            items: [
              {
                k: "spd",
                label: "Speed (slow ↔ fast)",
                min: 0.1,
                max: 3,
                step: 0.05,
                fmt: x1,
              },
              {
                k: "Om",
                label: "Ω (drive speed)",
                min: 0.5,
                max: 4,
                step: 0.01,
                fmt: f2,
              },
              { k: "dir", type: "check", label: "Reverse drive direction" },
              {
                k: "c",
                label: "Damping",
                min: 0,
                max: 0.3,
                step: 0.01,
                fmt: f2,
              },
            ],
          },
          {
            id: "phys",
            title: "Physics & geometry",
            items: [
              {
                k: "L",
                label: "L (length)",
                min: 0.4,
                max: 1.6,
                step: 0.05,
                fmt: f2,
              },
              {
                k: "G",
                label: "Gravity g",
                min: 1,
                max: 30,
                step: 0.1,
                fmt: f1,
              },
              {
                k: "Rx",
                label: "Rx (orbit width)",
                min: 0.2,
                max: 2,
                step: 0.05,
                fmt: f2,
              },
              {
                k: "Ry",
                label: "Ry (orbit height)",
                min: 0.2,
                max: 2,
                step: 0.05,
                fmt: f2,
              },
              {
                k: "spread",
                label: "Phase spread",
                min: 0,
                max: 3,
                step: 0.05,
                fmt: (v) => v.toFixed(2) + "×",
              },
              {
                k: "n",
                label: "Pendulum count",
                min: 2,
                max: NMAX,
                step: 1,
                fmt: (v) => "" + v,
              },
              {
                k: "th0",
                label: "Initial angle (on reset)",
                min: 0,
                max: 3.14,
                step: 0.01,
                fmt: f2,
              },
              { type: "btn", id: "rndPhys", label: "🎲 Random physics" },
            ],
          },
          {
            id: "cam",
            title: "Camera",
            items: [
              {
                k: "cspd",
                label: "Camera speed",
                min: 0,
                max: 4,
                step: 0.1,
                fmt: x1,
              },
              { k: "rot", type: "check", label: "Auto-rotate" },
              { k: "auto", type: "check", label: "Auto zoom in / out" },
              {
                k: "zamp",
                label: "Auto zoom range",
                min: 0.1,
                max: 0.8,
                step: 0.01,
                fmt: f2,
              },
            ],
          },
          {
            id: "col",
            title: "Colors",
            items: [
              {
                k: "mode",
                type: "select",
                label: "Palette",
                opts: [
                  ["rainbow", "Rainbow"],
                  ["single", "Single color"],
                  ["gradient", "Two-color gradient"],
                  ["random", "Random (per pendulum)"],
                  ["fire", "Fire"],
                  ["ocean", "Ocean"],
                  ["aurora", "Aurora"],
                  ["sunset", "Sunset"],
                  ["neon", "Neon"],
                ],
              },
              { k: "c1", type: "color", label: "Color" },
              { k: "c2", type: "color", label: "Second color" },
              {
                k: "hue",
                label: "Hue shift",
                min: 0,
                max: 360,
                step: 1,
                fmt: (v) => v + "°",
              },
              {
                k: "sat",
                label: "Saturation",
                min: 0,
                max: 1,
                step: 0.01,
                fmt: pct,
              },
              {
                k: "bri",
                label: "Brightness",
                min: 0.3,
                max: 2,
                step: 0.05,
                fmt: pct,
              },
              {
                k: "drift",
                label: "Color cycling",
                min: 0,
                max: 1,
                step: 0.05,
                fmt: (v) => (v === 0 ? "off" : f2(v)),
              },
              { type: "btn", id: "rndCol", label: "🎲 Randomize colors" },
            ],
          },
          {
            id: "pick",
            title: "Pendulum colors",
            items: [
              {
                k: "sel",
                label: "Pendulum #",
                min: 1,
                max: 56,
                step: 1,
                fmt: (v) => "" + v,
              },
              {
                k: "apply",
                type: "select",
                label: "Apply to",
                opts: [
                  ["0", "This pendulum only"],
                  ["2", "Every 2nd, from this one"],
                  ["3", "Every 3rd, from this one"],
                  ["4", "Every 4th, from this one"],
                  ["1", "All pendulums"],
                ],
              },
              { k: "pcol", type: "color", label: "Custom color" },
              {
                type: "row",
                btns: [
                  {
                    id: "pRnd",
                    label: "🎲 Random",
                    title: "Random custom color",
                  },
                  {
                    id: "pRev",
                    label: "Revert",
                    title: "Back to palette color",
                  },
                ],
              },
              { type: "btn", id: "pClr", label: "Clear all custom colors" },
              {
                type: "hint",
                text: "With this section open, tap a pendulum on screen to select it. Custom colors override the palette.",
              },
            ],
          },
          {
            id: "disp",
            title: "Display",
            items: [
              { k: "bg", type: "color", label: "Background" },
              { k: "trails", type: "check", label: "Trails" },
              {
                k: "tlen",
                label: "Trail length",
                min: 50,
                max: 800,
                step: 10,
                fmt: (v) => "" + v,
              },
              {
                k: "fade",
                label: "Trail fade sharpness",
                min: 1,
                max: 8,
                step: 0.1,
                fmt: f1,
              },
              { k: "rods", type: "check", label: "Rods" },
              {
                k: "rodOp",
                label: "Rod opacity",
                min: 0,
                max: 1,
                step: 0.05,
                fmt: pct,
              },
              { k: "bobs", type: "check", label: "Bobs" },
              {
                k: "bobSz",
                label: "Bob size",
                min: 1,
                max: 8,
                step: 0.2,
                fmt: f1,
              },
              {
                k: "glow",
                label: "Bob glow",
                min: 0,
                max: 1,
                step: 0.05,
                fmt: pct,
              },
              { k: "pivs", type: "check", label: "Pivot points" },
              {
                k: "pivSz",
                label: "Pivot size",
                min: 1,
                max: 6,
                step: 0.2,
                fmt: f1,
              },
              { type: "btn", id: "defaults", label: "↺ Restore all defaults" },
            ],
          },
        ];
        const ITEM = {};
        const dec = (s) => {
          s = String(s);
          return s.includes(".") ? s.split(".")[1].length : 0;
        };
        function itemHTML(it) {
          const id = "x_" + it.k;
          switch (it.type) {
            case "check":
              return `<label class="sw"><span>${it.label}</span><input id="${id}" type="checkbox"></label>`;
            case "color":
              return `<label class="sw"><span>${it.label}</span><input id="${id}" type="color"></label>`;
            case "select":
              return `<label><span>${it.label}</span><select id="${id}">${it.opts.map((o) => `<option value="${o[0]}">${o[1]}</option>`).join("")}</select></label>`;
            case "btn":
              return `<button id="${it.id}" type="button">${it.label}</button>`;
            case "row":
              return `<div class="row">${it.btns.map((b) => `<button id="${b.id}" type="button" title="${b.title || ""}">${b.label}</button>`).join("")}</div>`;
            case "hint":
              return `<div class="hint">${it.text}</div>`;
            default:
              return `<label><span>${it.label} <b id="${id}_v"></b></span><input id="${id}" type="range" min="${it.min}" max="${it.max}" step="${it.step}"></label>`;
          }
        }

        /* ───────── simulation ───────── */
        const th = new Float64Array(NMAX),
          w = new Float64Array(NMAX);
        let t = 0,
          paused = false,
          n = S.n;
        let pW = S.Om,
          pO2 = S.Om * S.Om,
          pL = S.L,
          pG = S.G,
          pRx = S.Rx,
          pRy = S.Ry,
          pC = S.c,
          pPh = (2 * Math.PI) / S.n;
        function cachePhys() {
          n = S.n;
          pW = S.dir ? -S.Om : S.Om;
          pO2 = S.Om * S.Om;
          pL = S.L;
          pG = S.G;
          pRx = S.Rx;
          pRy = S.Ry;
          pC = S.c;
          pPh = (2 * Math.PI * S.spread) / n;
        }
        // pivot acceleration  a_p = -Ω² (Rx cos, Ry sin)
        function alpha(i, tt, q, v) {
          const a = pW * tt + pPh * i;
          const ax = -pO2 * pRx * Math.cos(a),
            ay = -pO2 * pRy * Math.sin(a);
          return (
            -(pG / pL) * Math.sin(q) -
            (ax * Math.cos(q) + ay * Math.sin(q)) / pL -
            pC * v
          );
        }
        function step(h) {
          // RK4 on (θ, ω)
          for (let i = 0; i < n; i++) {
            const q = th[i],
              v = w[i];
            const k1q = v,
              k1v = alpha(i, t, q, v);
            const k2q = v + (h / 2) * k1v,
              k2v = alpha(i, t + h / 2, q + (h / 2) * k1q, v + (h / 2) * k1v);
            const k3q = v + (h / 2) * k2v,
              k3v = alpha(i, t + h / 2, q + (h / 2) * k2q, v + (h / 2) * k2v);
            const k4q = v + h * k3v,
              k4v = alpha(i, t + h, q + h * k3q, v + h * k3v);
            th[i] = q + (h / 6) * (k1q + 2 * k2q + 2 * k3q + k4q);
            w[i] = v + (h / 6) * (k1v + 2 * k2v + 2 * k3v + k4v);
          }
          t += h;
        }
        function pivot(i, out) {
          const a = pW * t + pPh * i;
          out[0] = pRx * Math.cos(a);
          out[1] = pRy * Math.sin(a);
        }

        /* ───────── three.js scene ───────── */
        const canvas = $("c");
        const renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          alpha: true,
        });
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(DPR);
        const scene = new THREE.Scene();
        const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 60);
        const TGT = new THREE.Vector3(0, -0.35, -0.65);
        let yaw = 0,
          dist = 5.5,
          zoom = 1,
          zoomT = 1,
          az = 1;
        const setZ = (v) => {
          zoomT = Math.min(2.2, Math.max(0.25, v));
        };
        function tex(draw) {
          const c = document.createElement("canvas");
          c.width = c.height = 64;
          draw(c.getContext("2d"));
          return new THREE.CanvasTexture(c);
        }

        // trails (index 0 = newest). Colours are rewritten by recolor().
        const tp = new Float32Array(NMAX * T * 3),
          tc = new Float32Array(NMAX * T * 3),
          idxArr = new Uint32Array(NMAX * (T - 1) * 2);
        const tg = new THREE.BufferGeometry();
        tg.setAttribute("position", new THREE.BufferAttribute(tp, 3));
        tg.setAttribute("color", new THREE.BufferAttribute(tc, 3));
        tg.setIndex(new THREE.BufferAttribute(idxArr, 1));
        const trailObj = new THREE.LineSegments(
          tg,
          new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }),
        );
        trailObj.frustumCulled = false;
        scene.add(trailObj);

        // rods
        const rp = new Float32Array(NMAX * 6),
          rc = new Float32Array(NMAX * 6);
        const rg = new THREE.BufferGeometry();
        rg.setAttribute("position", new THREE.BufferAttribute(rp, 3));
        rg.setAttribute("color", new THREE.BufferAttribute(rc, 3));
        const rodMat = new THREE.LineBasicMaterial({
          vertexColors: true,
          transparent: true,
          opacity: S.rodOp,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const rodObj = new THREE.LineSegments(rg, rodMat);
        rodObj.frustumCulled = false;
        scene.add(rodObj);

        // bobs, pivots, glow, selection rings
        const dotTex = tex((x) => {
          x.beginPath();
          x.arc(32, 32, 30, 0, Math.PI * 2);
          x.fillStyle = "#fff";
          x.fill();
        });
        const glowTex = tex((x) => {
          const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
          g.addColorStop(0, "rgba(255,255,255,1)");
          g.addColorStop(0.35, "rgba(255,255,255,.3)");
          g.addColorStop(1, "rgba(255,255,255,0)");
          x.fillStyle = g;
          x.fillRect(0, 0, 64, 64);
        });
        const ringTex = tex((x) => {
          x.lineWidth = 5;
          x.strokeStyle = "#fff";
          x.beginPath();
          x.arc(32, 32, 26, 0, Math.PI * 2);
          x.stroke();
        });
        function pts(size, colors) {
          const g = new THREE.BufferGeometry();
          g.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array(NMAX * 3), 3),
          );
          if (colors)
            g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
          const m = new THREE.PointsMaterial({
            size,
            sizeAttenuation: false,
            vertexColors: !!colors,
            color: 0xffffff,
            map: dotTex,
            transparent: true,
            alphaTest: 0.5,
            depthWrite: false,
          });
          const p = new THREE.Points(g, m);
          p.frustumCulled = false;
          scene.add(p);
          return p;
        }
        const bc = new Float32Array(NMAX * 3);
        const bobs = pts(S.bobSz * DPR, bc),
          pivs = pts(S.pivSz * DPR, null);
        const glowObj = new THREE.Points(
          bobs.geometry,
          new THREE.PointsMaterial({
            size: 15 * DPR,
            sizeAttenuation: false,
            vertexColors: true,
            map: glowTex,
            transparent: true,
            opacity: S.glow,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }),
        );
        glowObj.frustumCulled = false;
        scene.add(glowObj);
        const hlGeo = new THREE.BufferGeometry();
        hlGeo.setAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(NMAX * 3), 3),
        );
        const hl = new THREE.Points(
          hlGeo,
          new THREE.PointsMaterial({
            size: 30 * DPR,
            sizeAttenuation: false,
            color: 0xffffff,
            map: ringTex,
            transparent: true,
            depthWrite: false,
          }),
        );
        hl.frustumCulled = false;
        hl.visible = false;
        scene.add(hl);

        /* ───────── colours ───────── */
        const col = new THREE.Color(),
          tmpA = new THREE.Color(),
          tmpB = new THREE.Color(),
          hsl = { h: 0, s: 0, l: 0 };
        const rnd = [];
        for (let i = 0; i < NMAX; i++) rnd.push(new THREE.Color());
        const randColor = (c) =>
          c.setHSL(
            Math.random(),
            0.75 + 0.25 * Math.random(),
            0.52 + 0.16 * Math.random(),
          );
        const reshuffle = () => rnd.forEach(randColor);
        reshuffle();
        const PAL = {
          fire: ["#ffe27a", "#ff8a3d", "#ff3d3d", "#a1124a"],
          ocean: ["#7cf3ff", "#2b8cff", "#3b3bd6", "#8a3bff"],
          aurora: ["#4dffb0", "#3dd6ff", "#8f6bff", "#ff6bd0"],
          sunset: ["#ffd36b", "#ff8f6b", "#ff5e9a", "#7a4dff"],
          neon: ["#ff2bd6", "#2bffe9", "#fff82b", "#ff2bd6"],
        };
        const PALC = {};
        Object.keys(PAL).forEach((k) => {
          PALC[k] = PAL[k].map((h) => new THREE.Color(h));
        });
        function palette(arr, tt, out) {
          const x = Math.min(Math.max(tt, 0), 1) * (arr.length - 1),
            i = Math.min(Math.floor(x), arr.length - 2);
          return out.copy(arr[i]).lerp(arr[i + 1], x - i);
        }
        let hueAcc = 0;
        const ov = new Array(NMAX).fill(null); // per-pendulum custom colours

        function baseColor(i, out) {
          const tt = n > 1 ? i / (n - 1) : 0;
          switch (S.mode) {
            case "single":
              out.set(S.c1);
              break;
            case "gradient":
              out.set(S.c1).lerp(tmpB.set(S.c2), tt);
              break;
            case "random":
              out.copy(rnd[i]);
              break;
            case "rainbow":
              out.setHSL(i / n, 1, 0.6);
              break;
            default:
              palette(PALC[S.mode] || PALC.neon, tt, out);
          }
          const sh = S.hue / 360 + hueAcc;
          if (sh !== 0 || S.sat !== 1) {
            out.getHSL(hsl);
            out.setHSL((hsl.h + sh) % 1, Math.min(1, hsl.s * S.sat), hsl.l);
          }
          return out;
        }
        const finalColor = (i, out) =>
          ov[i] ? out.copy(ov[i]) : baseColor(i, out);

        const fadeT = new Float32Array(T);
        function buildFade() {
          const L = S.tlen;
          for (let k = 0; k < T; k++)
            fadeT[k] = k < L ? Math.pow(1 - k / L, S.fade) * 1.3 * S.bri : 0;
        }
        function paintOne(i) {
          finalColor(i, col);
          const r = col.r,
            g = col.g,
            b = col.b,
            o = i * T * 3;
          for (let k = 0; k < T; k++) {
            const m = fadeT[k],
              q = o + k * 3;
            tc[q] = r * m;
            tc[q + 1] = g * m;
            tc[q + 2] = b * m;
          }
          bc[i * 3] = r + (1 - r) * 0.08;
          bc[i * 3 + 1] = g + (1 - g) * 0.08;
          bc[i * 3 + 2] = b + (1 - b) * 0.08;
          const br = S.bri,
            j = i * 6;
          rc[j] = r * 0.03 * br;
          rc[j + 1] = g * 0.03 * br;
          rc[j + 2] = b * 0.03 * br;
          rc[j + 3] = r * br;
          rc[j + 4] = g * br;
          rc[j + 5] = b * br;
        }
        function flushColors() {
          tg.attributes.color.needsUpdate = true;
          bobs.geometry.attributes.color.needsUpdate = true;
          rg.attributes.color.needsUpdate = true;
        }
        function recolor() {
          buildFade();
          for (let i = 0; i < n; i++) paintOne(i);
          flushColors();
        }
        function rebuildIndex() {
          const L = S.tlen;
          let c = 0;
          for (let i = 0; i < n; i++) {
            const b = i * T;
            for (let k = 0; k < L - 1; k++) {
              idxArr[c++] = b + k;
              idxArr[c++] = b + k + 1;
            }
          }
          tg.index.needsUpdate = true;
          tg.setDrawRange(0, c);
        }
        function rebuildN() {
          rg.setDrawRange(0, n * 2);
          bobs.geometry.setDrawRange(0, n);
          pivs.geometry.setDrawRange(0, n);
          rebuildIndex();
          recolor();
          updatePickUI();
          reset();
        }
        function targets() {
          const s = S.sel - 1,
            st = parseInt(S.apply, 10) || 0;
          if (st === 0) return [s];
          const r = [];
          for (let i = 0; i < n; i++)
            if ((((i - s) % st) + st) % st === 0) r.push(i);
          return r;
        }
        function updatePickUI() {
          S.sel = Math.min(Math.max(1, S.sel), n);
          $("x_sel").max = n;
          syncUI("sel");
          const c = finalColor(S.sel - 1, tmpA);
          S.pcol = "#" + c.getHexString();
          $("x_pcol").value = S.pcol;
        }
        function updateHL() {
          if (!hl.visible) return;
          const bp = bobs.geometry.attributes.position.array,
            hp = hlGeo.attributes.position.array,
            list = targets();
          for (let j = 0; j < list.length; j++) {
            const i = list[j];
            hp[j * 3] = bp[i * 3];
            hp[j * 3 + 1] = bp[i * 3 + 1];
            hp[j * 3 + 2] = 0;
          }
          hlGeo.setDrawRange(0, list.length);
          hlGeo.attributes.position.needsUpdate = true;
        }
        function randomizeColors() {
          const modes = [
            "rainbow",
            "single",
            "gradient",
            "random",
            "fire",
            "ocean",
            "aurora",
            "sunset",
            "neon",
          ];
          let m;
          do {
            m = modes[Math.floor(Math.random() * modes.length)];
          } while (m === S.mode);
          S.mode = m;
          randColor(tmpA);
          S.c1 = "#" + tmpA.getHexString();
          tmpA.getHSL(hsl);
          tmpB.setHSL((hsl.h + 0.15 + Math.random() * 0.45) % 1, 0.85, 0.6);
          S.c2 = "#" + tmpB.getHexString();
          S.hue =
            m === "rainbow" || PALC[m] ? Math.floor(Math.random() * 360) : 0;
          reshuffle();
          ["mode", "c1", "c2", "hue"].forEach(syncUI);
          applyKey("mode");
        }

        /* ───────── per-frame geometry ───────── */
        const pv = [0, 0];
        function sync() {
          const bp = bobs.geometry.attributes.position.array,
            pp = pivs.geometry.attributes.position.array;
          for (let i = 0; i < n; i++) {
            pivot(i, pv);
            const bx = pv[0] + pL * Math.sin(th[i]),
              by = pv[1] - pL * Math.cos(th[i]),
              j = i * 3,
              r = i * 6;
            pp[j] = pv[0];
            pp[j + 1] = pv[1];
            pp[j + 2] = 0;
            bp[j] = bx;
            bp[j + 1] = by;
            bp[j + 2] = 0;
            rp[r] = pv[0];
            rp[r + 1] = pv[1];
            rp[r + 2] = 0;
            rp[r + 3] = bx;
            rp[r + 4] = by;
            rp[r + 5] = 0;
          }
          bobs.geometry.attributes.position.needsUpdate =
            pivs.geometry.attributes.position.needsUpdate =
            rg.attributes.position.needsUpdate =
            tg.attributes.position.needsUpdate =
              true;
          updateHL();
        }
        function pushTrail() {
          for (let i = 0; i < n; i++) {
            pivot(i, pv);
            const bx = pv[0] + pL * Math.sin(th[i]),
              by = pv[1] - pL * Math.cos(th[i]),
              o = i * T * 3;
            for (let k = T - 1; k > 0; k--) {
              const q = o + k * 3;
              tp[q] = tp[q - 3];
              tp[q + 1] = tp[q - 2];
            }
            tp[o] = bx;
            tp[o + 1] = by;
          }
        }
        function reset() {
          t = 0;
          th.fill(0);
          w.fill(0);
          for (let i = 0; i < n; i++) {
            th[i] = S.th0;
            pivot(i, pv);
            const bx = pv[0] + pL * Math.sin(S.th0),
              by = pv[1] - pL * Math.cos(S.th0);
            for (let k = 0; k < T; k++) {
              const q = (i * T + k) * 3;
              tp[q] = bx;
              tp[q + 1] = by;
              tp[q + 2] = -k * ZS;
            }
          }
          sync();
        }
        function resize() {
          const r = canvas.getBoundingClientRect(),
            W = r.width,
            Hh = r.height;
          renderer.setSize(W, Hh, false);
          cam.aspect = W / Hh;
          cam.updateProjectionMatrix();
          dist = Math.max(
            5.4,
            3.4 / (Math.tan((22.5 * Math.PI) / 180) * cam.aspect),
          );
        }
        addEventListener("resize", resize);

        /* ───────── apply a changed setting ───────── */
        function applyBg() {
          const c = new THREE.Color(S.bg),
            m = c.clone().multiplyScalar(0.45);
          const g = `radial-gradient(ellipse at 50% 45%,#${c.getHexString()} 0%,#${m.getHexString()} 55%,#000 100%)`;
          document.documentElement.style.background = g;
          document.body.style.background = g;
        }
        function showColorRows() {
          $("x_c1").closest("label").style.display =
            S.mode === "single" || S.mode === "gradient" ? "" : "none";
          $("x_c2").closest("label").style.display =
            S.mode === "gradient" ? "" : "none";
        }
        const rt = $("rt"),
          menu = $("menu");
        function syncRtIcon() {
          rt.classList.toggle("dim", !S.rot);
          rt.setAttribute("aria-pressed", String(S.rot));
          rt.title = "Auto-rotate: " + (S.rot ? "on" : "off");
        }
        function applyKey(k) {
          switch (k) {
            case "Om":
            case "dir":
            case "L":
            case "G":
            case "Rx":
            case "Ry":
            case "c":
            case "spread":
              cachePhys();
              break;
            case "n":
              cachePhys();
              rebuildN();
              break;
            case "th0":
              reset();
              break;
            case "rot":
              syncRtIcon();
              break;
            case "mode":
              showColorRows();
              recolor();
              updatePickUI();
              break;
            case "c1":
            case "c2":
            case "hue":
            case "sat":
            case "bri":
            case "fade":
              recolor();
              updatePickUI();
              break;
            case "tlen":
              rebuildIndex();
              recolor();
              break;
            case "sel":
            case "apply":
              updatePickUI();
              break;
            case "pcol": {
              const c = new THREE.Color(S.pcol);
              targets().forEach((i) => {
                ov[i] = c.clone();
                paintOne(i);
              });
              flushColors();
              break;
            }
            case "bg":
              applyBg();
              break;
            case "trails":
              trailObj.visible = S.trails;
              break;
            case "rods":
              rodObj.visible = S.rods;
              break;
            case "rodOp":
              rodMat.opacity = S.rodOp;
              break;
            case "bobs":
            case "glow":
            case "bobSz":
              bobs.visible = S.bobs;
              glowObj.visible = S.bobs && S.glow > 0;
              glowObj.material.opacity = S.glow;
              bobs.material.size = S.bobSz * DPR;
              glowObj.material.size = (15 * DPR * S.bobSz) / 2.6;
              break;
            case "pivs":
            case "pivSz":
              pivs.visible = S.pivs;
              pivs.material.size = S.pivSz * DPR;
              break;
          }
        }
        function applyAll() {
          cachePhys();
          rebuildN();
          [
            "bg",
            "trails",
            "rods",
            "rodOp",
            "bobs",
            "pivs",
            "rot",
            "mode",
          ].forEach(applyKey);
        }

        /* ───────── build the control panel ───────── */
        $("secs").innerHTML = SECS.map(
          (s) =>
            `<details id="sec_${s.id}"${s.open ? " open" : ""}><summary>${s.title}</summary><div class="body">${s.items.map(itemHTML).join("")}</div></details>`,
        ).join("");
        SECS.forEach((s) =>
          s.items.forEach((it) => {
            if (it.k) {
              it.fmt = it.fmt || ((v) => v.toFixed(dec(it.step)));
              ITEM[it.k] = it;
            }
          }),
        );
        function syncUI(k) {
          const it = ITEM[k],
            el = $("x_" + k);
          if (!it || !el) return;
          if (it.type === "check") el.checked = !!S[k];
          else el.value = S[k];
          if (!it.type) $("x_" + k + "_v").textContent = it.fmt(+S[k]);
        }
        const BTN = {
          rndPhys() {
            const r = (k, lo, hi) => {
              const it = ITEM[k];
              let v = lo + Math.random() * (hi - lo);
              v = Math.round(v / it.step) * it.step;
              S[k] = Math.min(it.max, Math.max(it.min, +v.toFixed(4)));
              syncUI(k);
            };
            r("Om", 1, 4);
            r("L", 0.5, 1.5);
            r("c", 0, 0.08);
            r("Rx", 0.4, 1.6);
            r("Ry", 0.2, 1.2);
            r("spread", 0.3, 2.5);
            cachePhys();
            reset();
          },
          rndCol: randomizeColors,
          pRnd() {
            targets().forEach((i) => {
              ov[i] = randColor(new THREE.Color());
              paintOne(i);
            });
            flushColors();
            updatePickUI();
          },
          pRev() {
            targets().forEach((i) => {
              ov[i] = null;
              paintOne(i);
            });
            flushColors();
            updatePickUI();
          },
          pClr() {
            ov.fill(null);
            recolor();
            updatePickUI();
          },
          defaults() {
            Object.assign(S, DEF);
            hueAcc = 0;
            ov.fill(null);
            reshuffle();
            Object.keys(ITEM).forEach(syncUI);
            applyAll();
          },
        };
        Object.keys(BTN).forEach((id) =>
          $(id).addEventListener("click", BTN[id]),
        );
        Object.keys(ITEM).forEach((k) => {
          const it = ITEM[k],
            el = $("x_" + k);
          const h = () => {
            S[k] =
              it.type === "check"
                ? el.checked
                : it.type === "select" || it.type === "color"
                  ? el.value
                  : +el.value;
            syncUI(k);
            applyKey(k);
          };
          el.addEventListener("input", h);
          el.addEventListener("change", h);
        });
        const secPick = $("sec_pick");

        /* ───────── footer buttons, input handling ───────── */
        $("rs").onclick = reset;
        const PAUSE_SVG =
            '<svg viewBox="0 0 24 24"><rect class="f" x="6" y="5" width="4" height="14" rx="1"/><rect class="f" x="14" y="5" width="4" height="14" rx="1"/></svg>',
          PLAY_SVG =
            '<svg viewBox="0 0 24 24"><path class="f" d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5z"/></svg>';
        const pzb = $("pz");
        pzb.onclick = () => {
          paused = !paused;
          pzb.innerHTML = paused ? PLAY_SVG : PAUSE_SVG;
          pzb.title = paused ? "Play (Space)" : "Pause (Space)";
          pzb.setAttribute("aria-label", paused ? "Play" : "Pause");
        };
        $("mb").onclick = () => menu.classList.toggle("open");
        rt.onclick = () => {
          S.rot = !S.rot;
          syncUI("rot");
          syncRtIcon();
        };
        $("zi").onclick = () => setZ(zoomT / 1.25);
        $("zo").onclick = () => setZ(zoomT * 1.25);
        canvas.addEventListener(
          "wheel",
          (e) => {
            e.preventDefault();
            setZ(zoomT * Math.exp(e.deltaY * 0.0012));
          },
          { passive: false },
        );
        let pd = 0,
          pz0 = 1;
        const td = (e) =>
          Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY,
          );
        canvas.addEventListener(
          "touchstart",
          (e) => {
            if (e.touches.length === 2) {
              pd = td(e);
              pz0 = zoomT;
            }
          },
          { passive: true },
        );
        canvas.addEventListener(
          "touchmove",
          (e) => {
            if (e.touches.length === 2 && pd) {
              e.preventDefault();
              setZ((pz0 * pd) / td(e));
            }
          },
          { passive: false },
        );
        canvas.addEventListener(
          "touchend",
          () => {
            pd = 0;
          },
          { passive: true },
        );
        function fs() {
          const d = document;
          if (d.fullscreenElement) d.exitFullscreen();
          else
            d.documentElement.requestFullscreen &&
              d.documentElement.requestFullscreen().catch(() => {});
        }
        $("fs").onclick = fs;
        canvas.addEventListener("dblclick", fs);

        // nearest bob under the pointer (CSS px), or -1
        const vtmp = new THREE.Vector3();
        function pickAt(e) {
          const r = canvas.getBoundingClientRect(),
            px = e.clientX - r.left,
            py = e.clientY - r.top,
            bp = bobs.geometry.attributes.position.array;
          let best = -1,
            bd = 34;
          for (let i = 0; i < n; i++) {
            vtmp.set(bp[i * 3], bp[i * 3 + 1], 0).project(cam);
            if (vtmp.z > 1) continue;
            const d = Math.hypot(
              (vtmp.x * 0.5 + 0.5) * r.width - px,
              (-vtmp.y * 0.5 + 0.5) * r.height - py,
            );
            if (d < bd) {
              bd = d;
              best = i;
            }
          }
          return best;
        }
        canvas.addEventListener("click", (e) => {
          if (menu.classList.contains("open") && secPick.open) {
            const i = pickAt(e);
            if (i >= 0) {
              S.sel = i + 1;
              syncUI("sel");
              applyKey("sel");
            }
            return;
          }
          menu.classList.remove("open");
        });
        addEventListener("keydown", (e) => {
          const tag = e.target && e.target.tagName;
          if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
          if (e.key === "f" || e.key === "F") fs();
          if (e.key === "c" || e.key === "C") randomizeColors();
          if (e.key === "+" || e.key === "=") setZ(zoomT / 1.25);
          if (e.key === "-" || e.key === "_") setZ(zoomT * 1.25);
          if (e.key === " ") pzb.click();
        });

        /* ───────── start ───────── */
        Object.keys(ITEM).forEach(syncUI);
        resize();
        applyAll();
        let last = performance.now(),
          acc = 0;
        (function loop(now) {
          requestAnimationFrame(loop);
          const d = Math.min(((now || last) - last) / 1000, 0.05);
          last = now || last;
          hl.visible = secPick.open && menu.classList.contains("open");
          if (!paused) {
            acc += d * S.spd;
            let g = 0;
            while (acc >= H && g++ < 80) {
              step(H);
              pushTrail();
              acc -= H;
            }
            if (g >= 80) acc = 0;
            if (S.rot) yaw += d * 0.12 * S.cspd;
          }
          if (S.drift > 0) {
            hueAcc = (hueAcc + d * S.drift * 0.08) % 1;
            recolor();
          }
          sync();
          zoom += (zoomT - zoom) * Math.min(1, d * 8);
          const at = S.auto ? Math.exp(S.zamp * Math.sin(yaw * 0.9 + 1)) : 1;
          az += (at - az) * Math.min(1, d * 3);
          const D = dist * zoom * az,
            pitch = 0.28 + 0.2 * Math.sin(yaw * 1.3),
            cp = Math.cos(pitch);
          cam.position.set(
            TGT.x + D * Math.sin(yaw) * cp,
            TGT.y + D * Math.sin(pitch),
            TGT.z + D * Math.cos(yaw) * cp,
          );
          cam.lookAt(TGT);
          renderer.render(scene, cam);
        })();
      })();