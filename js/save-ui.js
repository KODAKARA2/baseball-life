// Portable saves stay separate from sound/motion preferences on this device.
(function () {
  if (typeof document === 'undefined') return;
  U.openSave = function () {
    if (document.querySelector('.save-modal, .mg-wrap, .practice-modal')) return;
    var opener = document.activeElement, m = document.createElement('div'), reading = 0;
    m.className = 'modal save-modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', '저장 이동과 복구');
    m.innerHTML = '<div class="sheet"><h2>저장 이동·복구</h2><p>경력·선수 수첩·엔딩 도감·다음 인생 보너스를 함께 옮깁니다. 소리·움직임 설정은 이 기기에 남습니다.</p><p class="save-status" role="status"></p><button class="export-save">파일 내보내기</button><label class="save-file">파일 가져오기<input class="import-save" type="file" accept="application/json,.json"></label><button class="recover-save">가져오기 전 복구 사본</button><div class="save-preview" aria-live="polite"></div><button class="sheet-close">닫기 · 기존 진행 유지</button></div>';
    document.body.appendChild(m);
    var status = m.querySelector('.save-status'), preview = m.querySelector('.save-preview');
    status.textContent = E.saveStatus.error || ('마지막 저장: ' + (E.saveStatus.time ? new Date(E.saveStatus.time).toLocaleString() : '아직 저장 없음'));
    function shieldInput() {
      var shield = document.createElement('div'); shield.className = 'save-transition';
      function block(e) { e.preventDefault(); e.stopImmediatePropagation(); }
      document.body.appendChild(shield); document.addEventListener('keydown', block, true);
      setTimeout(function () { shield.remove(); document.removeEventListener('keydown', block, true); }, 260);
    }
    function close() { shieldInput(); reading++; m.remove(); document.removeEventListener('keydown', keys, true); if (opener && opener.isConnected) opener.focus(); }
    function cancel() { reading++; preview.replaceChildren(); m.querySelector('.import-save').value = ''; }
    function keys(e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); if (preview.childElementCount) cancel(); else close(); }
      if (e.key === 'Tab') {
        var buttons = Array.from(m.querySelectorAll('button, input')).filter(function (b) { return !b.disabled; });
        var first = buttons[0], last = buttons[buttons.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', keys, true);
    m.querySelector('.sheet-close').onclick = close;
    m.onclick = function (e) { if (e.target === m) close(); };
    function show(raw) {
      preview.replaceChildren();
      try {
        var data = E.previewImport(raw), p = document.createElement('p');
        p.textContent = (data.career ? data.career.이름 + ' · ' + data.career.포지션 + ' · ' + data.career.나이 + '세 · ' + data.career.시기 : '진행 중인 경력 없음') + ' / 도감 ' + (data.collection ? data.collection.인생수 || 0 : 0) + '회 / 다음 인생 보너스 ' + (data.bonus ? '있음' : '없음') + '. 현재 경력·도감·보너스를 모두 덮어씁니다.';
        preview.appendChild(p); status.textContent = '파일을 확인했습니다. 아래에서 적용하거나 취소하세요.';
        var apply = document.createElement('button'), back = document.createElement('button');
        apply.textContent = '확인 · 현재 저장 덮어쓰기'; back.textContent = '취소 · 기존 저장 유지';
        preview.append(apply, back); back.onclick = cancel;
        apply.onclick = function () {
          if (apply.disabled || !m.isConnected) return;
          apply.disabled = true;
          try { E.importSave(raw); Feedback.clearAll(); close(); U.closeModals(); if (E.state()) U.showGame(); else U.showSetup(); }
          catch (e) { status.textContent = e.message; apply.disabled = false; }
        };
      } catch (e) { status.textContent = '가져오기 실패: ' + e.message; }
    }
    m.querySelector('.import-save').onchange = async function (e) {
      var file = e.target.files[0], id = ++reading; preview.replaceChildren();
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) { status.textContent = '2MB 이하 파일만 가져올 수 있습니다.'; return; }
      try { var raw = await file.text(); if (m.isConnected && id === reading) show(raw); }
      catch (error) { if (m.isConnected && id === reading) status.textContent = '파일을 읽지 못했습니다: ' + error.message; }
    };
    m.querySelector('.recover-save').onclick = function () {
      reading++; preview.replaceChildren();
      try { var raw = E.recoverySave(); if (raw) show(raw); else status.textContent = '가져오기 전 복구 사본이 없습니다.'; }
      catch (e) { status.textContent = e.message; }
    };
    m.querySelector('.export-save').onclick = function () {
      try {
        var url = URL.createObjectURL(new Blob([E.exportSave()], { type: 'application/json' })), a = document.createElement('a');
        a.href = url; a.download = 'baseball-life-save.json'; a.click(); setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        status.textContent = '파일 다운로드를 요청했습니다. 다운로드 폴더를 확인하세요.';
      } catch (e) { status.textContent = '내보내기 실패: ' + e.message; }
    };
    m.querySelector('.export-save').focus();
  };
})();
