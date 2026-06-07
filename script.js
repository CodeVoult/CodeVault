async function saveScript() {
  const codeEl = document.getElementById('code');
  const code = codeEl.value.trim();
  
  if (!code) { 
    if (typeof showToast === 'function') {
      showToast('Paste a script first'); 
    } else {
      alert('Paste a script first');
    }
    return; 
  }

  // Animación de carga en el botón si existe
  const btn = document.querySelector('.btn-primary');
  const origBtnText = btn ? btn.innerHTML : 'Save Script';
  if (btn) {
    btn.textContent = 'Saving...';
    btn.disabled = true;
  }

  try {
    const res = await fetch('https://codevault-gvyn.onrender.com/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code })
    });

    if (!res.ok) throw new Error('save failed');

    const data = await res.json();
    const id   = data.id;

    // SOLUCIÓN MAESTRA: Enlaces usando tu dominio de GitHub (?raw=true) para burlar el bloqueo del ejecutor
    const viewUrl = 'https://leeh10.github.io/CodeVault/view.html?id=' + id;
    const rawUrl  = 'https://leeh10.github.io/CodeVault/view.html?id=' + id + '&raw=true';
    const ls      = 'loadstring(game:HttpGet("' + rawUrl + '"))()';

    // Rellenamos los campos interactivos del nuevo diseño
    document.getElementById('rawUrlText').textContent      = rawUrl;
    document.getElementById('loadstringText').textContent  = ls;
    document.getElementById('viewUrlText').textContent     = viewUrl;
    document.getElementById('scriptIdLabel').textContent   = '#' + id;
    document.getElementById('viewLink').href               = viewUrl;

    // Mostramos el contenedor de resultados de forma elegante
    const resultBox = document.getElementById('result');
    resultBox.style.display = 'block';
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    if (typeof showToast === 'function') showToast('Script saved!');

    // Guardar en almacenamiento local del dispositivo (tu nueva función de tracking)
    if (typeof registrarScriptId === 'function') {
      registrarScriptId(id);
    } else {
      localStorage.setItem('idUsuario', id);
    }

  } catch(e) {
    if (typeof showToast === 'function') {
      showToast('Error saving script');
    } else {
      alert('Error saving script');
    }
    console.error(e);
  } finally {
    // Restauramos el botón a su estado original
    if (btn) {
      btn.innerHTML = origBtnText;
      btn.disabled = false;
    }
  }
}

/* ── FUNCIONES DE COPIADO COMPLEMENTARIAS PARA LOS BOTONES NUEVOS ── */

function copyRawUrl() {
  const url  = document.getElementById('rawUrlText').textContent;
  const btn  = document.getElementById('copyUrlBtn');
  if (!url) return;
  navigator.clipboard.writeText(url).then(function(){
    if (typeof animateCopyBtn === 'function') animateCopyBtn(btn, btn.innerHTML);
    if (typeof showToast === 'function') showToast('Raw URL copied');
  });
}

function copyViewUrl() {
  const url  = document.getElementById('viewUrlText').textContent;
  const btn  = document.getElementById('copyViewBtn');
  if (!url) return;
  navigator.clipboard.writeText(url).then(function(){
    if (typeof animateCopyBtn === 'function') animateCopyBtn(btn, btn.innerHTML);
    if (typeof showToast === 'function') showToast('View URL copied');
  });
}

function copyLoadstring() {
  const ls   = document.getElementById('loadstringText').textContent;
  const btn  = document.getElementById('copyLsBtn');
  if (!ls) return;
  navigator.clipboard.writeText(ls).then(function(){
    if (typeof animateCopyBtn === 'function') animateCopyBtn(btn, btn.innerHTML);
    if (typeof showToast === 'function') showToast('Loadstring copied');
  });
}

function copyCode() {
  const codeEl = document.getElementById('code');
  if (!codeEl || !codeEl.value.trim()) { 
    if (typeof showToast === 'function') showToast('Nothing to copy'); 
    return; 
  }
  navigator.clipboard.writeText(codeEl.value).then(function(){ 
    if (typeof showToast === 'function') showToast('Code copied'); 
  });
}
