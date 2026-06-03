// Mapa de clientes SSE ativos por empresa_id
// { empresa_id: Set<res> }
const clientes = new Map();

function registrar(empresa_id, res) {
  if (!clientes.has(empresa_id)) {
    clientes.set(empresa_id, new Set());
  }
  clientes.get(empresa_id).add(res);
}

function remover(empresa_id, res) {
  const set = clientes.get(empresa_id);
  if (set) {
    set.delete(res);
    if (set.size === 0) clientes.delete(empresa_id);
  }
}

// Emite para todos os clientes da mesma empresa
function emitir(empresa_id, evento, dados) {
  const set = clientes.get(empresa_id);
  if (!set || set.size === 0) return;

  const payload = `event: ${evento}\ndata: ${JSON.stringify(dados)}\n\n`;

  for (const res of set) {
    try {
      res.write(payload);
    } catch {
      set.delete(res);
    }
  }
}

module.exports = {
  // GET /eventos — cliente se conecta e fica escutando
  conectar(req, res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // nginx: desativa buffering
    res.flushHeaders();

    const empresa_id = req.user.empresa_id;
    registrar(empresa_id, res);

    // Heartbeat a cada 25s para manter a conexão viva
    const heartbeat = setInterval(() => {
      try {
        res.write(':ping\n\n');
      } catch {
        clearInterval(heartbeat);
      }
    }, 25000);

    req.on('close', () => {
      clearInterval(heartbeat);
      remover(empresa_id, res);
    });
  },

  emitir,
};
