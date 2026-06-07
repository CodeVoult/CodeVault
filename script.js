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
    // Usamos tu servidor de Render activo
    const res = await fetch('https://codevault-vlv1.onrender.com/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code })
    });

    if (!res.ok) throw new Error('save failed');

    const data = await res.json();
    const id   = data.id;

    // Estructuración de enlaces limpia hacia tu pasarela inteligente
    const viewUrl = 'https://leeh10.github.io/CodeVault/view.html?id=' + id;
    const rawUrl  = 'https://codevault-vlv1.onrender.com/raw/' + id;
    const ls      = 'loadstring(game:HttpGet("' + rawUrl + '"))()';

    // Rellenamos los campos interactivos del diseño
    document.getElementById('rawUrlText').textContent      = rawUrl;
    document.getElementById('loadstringText').textContent  = ls;
    document.getElementById('viewUrlText').textContent     = viewUrl;
    document.getElementById('scriptIdLabel').textContent   = '#' + id;
    document.getElementById('viewLink').href               = viewUrl;

    // Mostramos el contenedor de resultados de forma elegante
    const resultBox = document.getElementById('result');
    if (resultBox) {
      resultBox.style.display = 'block';
      resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    if (typeof showToast === 'function') showToast('Script saved!');

    // ── VINCULACIÓN INTELIGENTE CON EL DASHBOARD ──
    const urlParams = new URLSearchParams(window.location.search);
    const folderId = urlParams.get('folderId');
    const editId = urlParams.get('editId'); // Detectamos si venimos en modo edición
    const loggedUser = sessionStorage.getItem("logged_user");

    if (loggedUser) {
      let vaultScripts = JSON.parse(localStorage.getItem("vault_scripts")) || [];
      
      if (editId) {
        // MODO EDICIÓN: Buscamos el script original en el baúl y actualizamos sus datos
        let scriptEncontrado = false;
        vaultScripts = vaultScripts.map(s => {
          if (s.id === editId) {
            s.id = id;     // Reemplazamos por el nuevo ID generado por Render
            s.code = code; // Actualizamos el código fuente
            scriptEncontrado = true;
          }
          return s;
        });

        // Si por alguna razón el script no existía (ej. se borró caché), lo recuperamos de forma segura
        if (!scriptEncontrado && folderId) {
          vaultScripts.push({
            id: id,
            folderId: folderId,
            username: loggedUser,
            title: "Script Editado",
            code: code
          });
        }

        localStorage.setItem("vault_scripts", JSON.stringify(vaultScripts));
        if (typeof showToast === 'function') showToast('✓ Script actualizado en el Dashboard');
        
        // Opcional: Actualizar la URL de la barra de direcciones para que los siguientes guardados sigan editando sobre el nuevo ID
        const nuevaUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?editId=' + id;
        window.history.pushState({ path: nuevaUrl }, '', nuevaUrl);

      } else if (folderId) {
        // MODO NUEVO SCRIPT: Si venimos de una carpeta y no estamos editando, creamos tarjeta nueva
        const scriptTitle = prompt("Ponle un nombre a tu Script para el Dashboard:") || "Nuevo Script";
        
        vaultScripts.push({
          id: id,                  // ID único de Render
          folderId: folderId,      // ID de la carpeta contenedora
          username: loggedUser,    // Usuario dueño del script
          title: scriptTitle.trim(),
          code: code               // Copia original para re-editar
        });
        
        localStorage.setItem("vault_scripts", JSON.stringify(vaultScripts));
        if (typeof showToast === 'function') showToast('✓ Script añadido a la carpeta');
      }
    }

    // Guardar ID general en almacenamiento local del dispositivo (Tracking alternativo)
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
