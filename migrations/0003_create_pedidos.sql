
CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    tipo_negocio TEXT NOT NULL,
    telefono TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'pendiente',
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pedidos_creado_en
ON pedidos(creado_en DESC);
