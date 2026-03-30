import React, { useState, useEffect } from "react";
import "../../styles/Logs.css";
import NavSpAdmin from "../components/NavSpAdmin";
import { Eye, X, Shield, FileDown, RefreshCw } from "lucide-react";
import { exportLogsPDF } from "../../utils/pdfExport";
import api from "../../api/axios";

interface Log {
  _id: string;
  nivel: 'info' | 'warn' | 'error';
  evento: string;
  metodo: string;
  ruta: string;
  statusCode: number;
  ip: string;
  userId?: string;
  detalle?: string;
  fecha: string;
}

const nivelColor: Record<string, string> = {
  info: '#38a169',
  warn: '#d69e2e',
  error: '#e53e3e',
};

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [logSeleccionado, setLogSeleccionado] = useState<Log | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/logs');
      setLogs(response.data.data);
    } catch (error) {
      console.error('Error cargando logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-MX', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="logs-container">
      <NavSpAdmin />

      <div className="logs-main">
        <header className="logs-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1>Seguridad del Sistema</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={fetchLogs}
              title="Recargar"
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 14px", borderRadius: "var(--radius-sm)",
                background: "#3182ce", color: "#fff", border: "none",
                cursor: "pointer", fontSize: "0.85rem", fontWeight: 600,
              }}
            >
              <RefreshCw size={15} /> Recargar
            </button>
            <button
              onClick={() => exportLogsPDF(logs)}
              title="Descargar PDF"
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 14px", borderRadius: "var(--radius-sm)",
                background: "#e53e3e", color: "#fff", border: "none",
                cursor: "pointer", fontSize: "0.85rem", fontWeight: 600,
              }}
            >
              <FileDown size={15} /> Descargar PDF
            </button>
          </div>
        </header>

        <div className="logs-content">
          <div className="logs-table-wrapper">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Nivel</th>
                  <th>Fecha</th>
                  <th>Detalles</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: 24 }}>
                      Cargando logs...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: 24 }}>
                      No hay logs registrados
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id}>
                      <td className="logs-descripcion">
                        <Shield size={18} /> {log.evento}
                      </td>
                      <td>
                        <span style={{
                          background: nivelColor[log.nivel] + '22',
                          color: nivelColor[log.nivel],
                          padding: '2px 10px',
                          borderRadius: 12,
                          fontWeight: 600,
                          fontSize: '0.8rem',
                        }}>
                          {log.nivel.toUpperCase()}
                        </span>
                      </td>
                      <td>{formatFecha(log.fecha)}</td>
                      <td>
                        <button
                          className="logs-btn-detalle"
                          onClick={() => setLogSeleccionado(log)}
                        >
                          <Eye size={16} /> Ver detalles
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {logSeleccionado && (
            <div className="logs-modal-overlay">
              <div className="logs-modal-container">
                <div className="logs-modal-header">
                  <h2>Detalles del Log</h2>
                  <X onClick={() => setLogSeleccionado(null)} style={{ cursor: 'pointer' }} />
                </div>

                <div className="logs-modal-body">
                  <p><strong>Evento:</strong> {logSeleccionado.evento}</p>
                  <p><strong>Nivel:</strong>{' '}
                    <span style={{ color: nivelColor[logSeleccionado.nivel], fontWeight: 600 }}>
                      {logSeleccionado.nivel.toUpperCase()}
                    </span>
                  </p>
                  <p><strong>Método:</strong> {logSeleccionado.metodo}</p>
                  <p><strong>Ruta:</strong> {logSeleccionado.ruta}</p>
                  <p><strong>Status:</strong> {logSeleccionado.statusCode}</p>
                  <p><strong>IP:</strong> {logSeleccionado.ip}</p>
                  {logSeleccionado.userId && (
                    <p><strong>Usuario ID:</strong> {logSeleccionado.userId}</p>
                  )}
                  <p><strong>Fecha:</strong> {formatFecha(logSeleccionado.fecha)}</p>
                  {logSeleccionado.detalle && (
                    <>
                      <p><strong>Detalle:</strong></p>
                      <div className="logs-modal-box">
                        {logSeleccionado.detalle}
                      </div>
                    </>
                  )}
                </div>

                <div className="logs-modal-footer">
                  <button
                    className="logs-btn-cerrar"
                    onClick={() => setLogSeleccionado(null)}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Logs;