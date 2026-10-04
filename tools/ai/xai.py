# xAI 이미지 API(Grok Imagine)로 그림 한 장 만들기
# 사용: python3 tools/ai/xai.py 이름 프롬프트파일 [참고그림 ...]
#   결과: assets/ai_raw/이름.jpg (같은 이름이 있으면 덮어씀. 폴더는 XAI_OUT 으로 바꿀 수 있음)
#   참고그림을 주면 /images/edits 로 같은 얼굴·그림체를 유지해서 그림 (최대 5장)
#   API 키: 환경 변수 XAI_API_KEY. (클라우드 세션처럼 프록시가 키를 붙여 주면 없어도 됨)
#   기본 설정: 모델 grok-imagine-image-2.0, 세로 2:3, 1k, low (장당 약 $0.04, 참고그림 있으면 $0.05)
import json, sys, subprocess, base64, os, tempfile
API = "https://api.x.ai/v1"
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.environ.get("XAI_OUT", os.path.join(HERE, "..", "..", "assets", "ai_raw"))

def call(path, body):
    with tempfile.TemporaryDirectory() as d:
        rf, hf = os.path.join(d, "req.json"), os.path.join(d, "h.txt")
        json.dump(body, open(rf, "w"))
        hdr = "Content-Type: application/json\n"
        if os.environ.get("XAI_API_KEY"): hdr += "Authorization: Bearer " + os.environ["XAI_API_KEY"] + "\n"
        open(hf, "w").write(hdr)
        r = subprocess.run(["curl", "-s", "--max-time", "300", "-H", "@" + hf, "-d", "@" + rf, API + path], capture_output=True, text=True)
    try: return json.loads(r.stdout)
    except Exception: return {"raw": r.stdout[:500], "err": r.stderr[:300]}

def main():
    name, pf, refs = sys.argv[1], sys.argv[2], sys.argv[3:]
    body = {"model": os.environ.get("XAI_MODEL", "grok-imagine-image-2.0"), "prompt": open(pf, encoding="utf-8").read().strip(),
            "n": 1, "response_format": "b64_json"}
    body.update(json.loads(os.environ.get("XAI_EXTRA", '{"aspect_ratio":"2:3","resolution":"1k","quality":"low"}')))
    path = "/images/generations"
    if refs:
        path = "/images/edits"
        imgs = [{"type": "image_url", "url": "data:%s;base64,%s" % ("image/png" if r.endswith(".png") else "image/jpeg",
                 base64.b64encode(open(r, "rb").read()).decode())} for r in refs]
        body["image"] = imgs[0] if len(imgs) == 1 else imgs
    res = call(path, body)
    data = res.get("data") if isinstance(res, dict) else None
    if not data: print("ERROR", json.dumps(res, ensure_ascii=False)[:800]); sys.exit(1)
    os.makedirs(OUT, exist_ok=True)
    b = base64.b64decode(data[0]["b64_json"]); fn = os.path.join(OUT, name + ".jpg")
    open(fn, "wb").write(b)
    print("saved", fn, len(b), "cost $%.3f" % (res.get("usage", {}).get("cost_in_usd_ticks", 0) / 1e10))

main()
