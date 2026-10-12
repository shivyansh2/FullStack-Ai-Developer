// Grab every button on the page and attach the same click handler to each.
const buttons = document.querySelectorAll('button[data-method]');

buttons.forEach((btn) => {
  btn.addEventListener('click', handleClick);
});

async function handleClick(event) {
  const btn = event.currentTarget;

  // Read the request details straight off the button's data-* attributes.
  const method = btn.dataset.method;
  const url = btn.dataset.url;
  const body = btn.dataset.body; 
  const outputEl = document.getElementById(btn.dataset.output);

  await sendRequest(method, url, body, btn, outputEl);
}

async function sendRequest(method, url, bodyString, btn, outputEl) {
  btn.disabled = true;
  outputEl.innerHTML = '<p>Sending...</p>';

  try {
    const options = { method };

    if (bodyString) {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = bodyString;
    }

    const response = await fetch(url, options);

   
    let data = null;
    try {
      data = await response.json();
    } catch {
      
    }

    const statusClass = response.ok ? 'ok' : 'err';

    outputEl.innerHTML = `
      <span class="status ${statusClass}">${response.status} ${response.statusText}</span>
      <pre>${data ? JSON.stringify(data, null, 2) : '(no body)'}</pre>
    `;
  } catch (err) {
    // This catches network failures (e.g. you're offline), not 4xx/5xx —
    // those still count as a "successful" fetch, just with a bad status.
    outputEl.innerHTML = `<p>Request failed: ${err.message}</p>`;
  } finally {
    btn.disabled = false;
  }
}