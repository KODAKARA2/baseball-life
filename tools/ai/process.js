// AI 그림 다듬기: 초록 배경 제거 + 200x300 픽셀 격자로 맞춤 → 투명 PNG
// 필요: npm i playwright && npx playwright install chromium
// 사용: node tools/ai/process.js images assets/ai_raw/heroine1_meet.jpg [...]   (이름_wedding 은 베일 초록 번짐까지 제거)
const { chromium } = require("playwright"); const fs = require("fs"), path = require("path");
(async () => { const [outDir, ...files] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage();
  for (const f of files) {
    const name = path.basename(f).replace(/(_\d+)?\.(jpg|png)$/, "");
    const data = "data:image/jpeg;base64," + fs.readFileSync(f).toString("base64");
    const all = /_wedding$/.test(name);   // 웨딩 베일처럼 비치는 부분은 전체 초록 번짐 제거
    const url = await p.evaluate(async ([d, all]) => {
      const im = new Image(); im.src = d; await im.decode();
      const W = im.width, H = im.height, c = document.createElement("canvas"); c.width = W; c.height = H;
      const x = c.getContext("2d"); x.drawImage(im, 0, 0); const id = x.getImageData(0, 0, W, H), px = id.data;
      // 1) 배경색 추정: 테두리 픽셀의 중앙값
      const border = []; for (let i = 0; i < W; i += 4) { border.push(i * 4, ((H - 1) * W + i) * 4); } for (let j = 0; j < H; j += 4) { border.push(j * W * 4, (j * W + W - 1) * 4); }
      const med = k => { const v = border.map(o => px[o + k]).sort((a, b) => a - b); return v[v.length >> 1]; };
      const bg = [med(0), med(1), med(2)];
      const dist = o => Math.hypot(px[o] - bg[0], px[o + 1] - bg[1], px[o + 2] - bg[2]);
      // 2) 테두리에서 시작하는 채우기(느슨한 기준) + 안쪽 고립된 배경(엄격한 기준)
      const mask = new Uint8Array(W * H), q = [];
      const T1 = 95, T2 = 45;
      for (let i = 0; i < W; i++) q.push(i, (H - 1) * W + i); for (let j = 0; j < H; j++) q.push(j * W, j * W + W - 1);
      while (q.length) { const k = q.pop(); if (mask[k]) continue; if (dist(k * 4) >= T1) continue; mask[k] = 1;
        const xx = k % W, yy = (k / W) | 0; if (xx > 0) q.push(k - 1); if (xx < W - 1) q.push(k + 1); if (yy > 0) q.push(k - W); if (yy < H - 1) q.push(k + W); }
      for (let k = 0; k < W * H; k++) if (!mask[k] && dist(k * 4) < T2) mask[k] = 1;
      // 3) 투명 처리 + 가장자리 초록 번짐 줄이기
      for (let k = 0; k < W * H; k++) { const o = k * 4;
        if (mask[k]) { px[o + 3] = 0; continue; }
        const xx = k % W, yy = (k / W) | 0; let edge = false;
        for (let dy = -2; dy <= 2 && !edge; dy++) for (let dx = -2; dx <= 2; dx++) { const nx = xx + dx, ny = yy + dy; if (nx >= 0 && ny >= 0 && nx < W && ny < H && mask[ny * W + nx]) { edge = true; break; } }
        if ((edge || all) && px[o + 1] > Math.max(px[o], px[o + 2])) px[o + 1] = Math.max(px[o], px[o + 2]);
      }
      x.putImageData(id, 0, 0);
      // 4) 200x300 픽셀 격자로 줄이고 반투명은 0/255로
      const s = document.createElement("canvas"); s.width = 200; s.height = 300; const sx = s.getContext("2d");
      sx.imageSmoothingQuality = "high"; sx.drawImage(c, 0, 0, 200, 300);
      const sd = sx.getImageData(0, 0, 200, 300); for (let o = 3; o < sd.data.length; o += 4) sd.data[o] = sd.data[o] < 128 ? 0 : 255;
      sx.putImageData(sd, 0, 0); return s.toDataURL("image/png");
    }, [data, all]);
    const out = path.join(outDir, name + ".png"); fs.writeFileSync(out, Buffer.from(url.split(",")[1], "base64")); console.log(out, fs.statSync(out).size);
  }
  await b.close(); })();
