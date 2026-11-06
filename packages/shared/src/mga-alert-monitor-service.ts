/**
 * MGA Automated Aviation Alert & Monitoring System
 * 
 * Central de Monitoramento Contínuo e Disparo de Alertas de Acidentes Aeronáuticos.
 * 
 * Modos de Alerta:
 * 1. PRELIMINARY_ALERT (Alerta Preliminar): Informação recente identificada em autoridade/notícia, aguardando relatório final.
 * 2. CONFIRMED_ALERT (Alerta Confirmado): Confirmação oficial por órgão aeronáutico (CENIPA, NTSB, BEA, etc.).
 * 
 * Escopo de Assinatura:
 * - GLOBAL: Notificações mundiais de acidentes e incidentes graves.
 * - REGIONAL: Ocorrências dentro de um raio geodésico (ex: 150 km de SBGR/São Paulo ou corredor habitual).
 */

export type AlertType = 'PRELIMINARY_ALERT' | 'CONFIRMED_ALERT';
export type NotificationChannel = 'EMAIL' | 'PUSH' | 'WEBHOOK' | 'IN_APP';

export interface UserAlertPreference {
  userId: string;
  userEmail: string;
  scope: 'GLOBAL' | 'REGIONAL';
  regionalCenter?: {
    name: string;
    latitude: number;
    longitude: number;
    radiusKm: number;
  };
  aircraftCategories: Array<'AIRPLANE' | 'HELICOPTER' | 'ALL'>;
  notifyPreliminary: boolean;
  notifyConfirmed: boolean;
  channels: NotificationChannel[];
}

export interface MonitoredAviationAlert {
  id: string;
  alertType: AlertType;
  title: string;
  aircraftDescription: string;
  registration?: string;
  aircraftType: 'HELICOPTER' | 'AIRPLANE' | 'OTHER';
  locationDescription: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  eventDate: string;
  detectedAt: string;
  sourceAgency: string;
  officialSourceUrl: string;
  status: 'AGUARDANDO_CONFIRMACAO' | 'CONFIRMADO_SIPAER' | 'INVESTIGACAO_ATIVA';
  summary: string;
  actionUrl: string;
}

/**
 * Construtor de E-mail / Payload de Notificação no Padrão EFB MGA
 */
export function buildMgaAlertEmail(alert: MonitoredAviationAlert): { subject: string; htmlContent: string; textContent: string } {
  const isPreliminary = alert.alertType === 'PRELIMINARY_ALERT';
  const badgeColor = isPreliminary ? '#eab308' : '#ef4444';
  const badgeText = isPreliminary ? 'OCORRÊNCIA PRELIMINAR' : 'OCORRÊNCIA CONFIRMADA';

  const subject = `[MGA ALERTA] ${badgeText}: ${alert.aircraftDescription} em ${alert.locationDescription}`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#050811;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#050811;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#0b0e17;border:1px solid rgba(255,255,255,0.1);border-radius:16px;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,0.5);">
          
          <!-- Top Bar Cockpit Dark -->
          <tr>
            <td style="padding:24px 32px;background:linear-gradient(180deg,#141724 0%,#0b0e17 100%);border-bottom:1px solid rgba(255,255,255,0.06);">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-family:monospace;font-size:18px;font-weight:900;letter-spacing:1px;color:#ff8800;">MGA</span>
                    <span style="font-family:monospace;font-size:11px;color:#94a3b8;margin-left:8px;">Aviation Intelligence</span>
                  </td>
                  <td align="right">
                    <span style="display:inline-block;padding:4px 10px;background-color:${badgeColor}20;border:1px solid ${badgeColor};border-radius:20px;font-family:monospace;font-size:10px;font-weight:bold;color:${badgeColor};text-transform:uppercase;">
                      ${badgeText}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Conteúdo Principal -->
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px 0;font-size:20px;font-weight:bold;color:#ffffff;line-height:1.3;">
                Nova Ocorrência Aeronáutica Identificada
              </h2>

              <p style="margin:0 0 24px 0;font-size:14px;color:#94a3b8;line-height:1.6;">
                O monitoramento contínuo do MGA identificou uma publicação recente de ocorrência aeronáutica registrada por fonte oficial.
              </p>

              <!-- Box de Detalhes Técnicos -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#121520;border:1px solid rgba(255,255,255,0.08);border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:13px;color:#64748b;font-family:monospace;width:30%;">
                    AERONAVE:
                  </td>
                  <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:13px;color:#ffffff;font-weight:bold;font-family:monospace;">
                    ${alert.aircraftDescription} ${alert.registration ? `(${alert.registration})` : ''}
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:13px;color:#64748b;font-family:monospace;">
                    LOCALIZAÇÃO:
                  </td>
                  <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:13px;color:#ffffff;font-family:monospace;">
                    ${alert.locationDescription}
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:13px;color:#64748b;font-family:monospace;">
                    DATA INFORMADA:
                  </td>
                  <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:13px;color:#ffffff;font-family:monospace;">
                    ${alert.eventDate}
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:13px;color:#64748b;font-family:monospace;">
                    FONTE OFICIAL:
                  </td>
                  <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:13px;color:#ff8800;font-family:monospace;">
                    ${alert.sourceAgency}
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;font-size:13px;color:#64748b;font-family:monospace;">
                    SITUAÇÃO:
                  </td>
                  <td style="padding:16px 20px;font-size:13px;color:#38bdf8;font-family:monospace;font-weight:bold;">
                    ${alert.status.replace(/_/g, ' ')}
                  </td>
                </tr>
              </table>

              <!-- Resumo do Relato -->
              <div style="background-color:#070a12;border-left:3px solid #ff8800;padding:16px;border-radius:0 8px 8px 0;margin-bottom:28px;">
                <p style="margin:0;font-size:13px;color:#cbd5e1;line-height:1.6;font-family:sans-serif;">
                  ${alert.summary}
                </p>
              </div>

              <!-- Botão CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <a href="${alert.actionUrl}" style="display:inline-block;padding:14px 28px;background-color:#ff8800;color:#0b0e17;text-decoration:none;border-radius:10px;font-weight:bold;font-size:14px;letter-spacing:0.5px;font-family:monospace;box-shadow:0 4px 14px rgba(255,136,0,0.35);">
                      VER OCORRÊNCIA NO MAPA MGA →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0 0;font-size:11px;color:#64748b;text-align:center;line-height:1.5;">
                Consulte a fonte original para acompanhar o andamento da investigação. O MGA classifica dados oficiais e não emite laudos periciais independentes.
              </p>
            </td>
          </tr>

          <!-- Rodapé de Conformidade -->
          <tr>
            <td style="padding:20px 32px;background-color:#06080e;border-top:1px solid rgba(255,255,255,0.05);text-align:center;font-size:11px;color:#475569;font-family:monospace;">
              MGA — Memória Geográfica e Aeronáutica • Conexão Segura PostGIS / WGS84
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const textContent = `
[MGA ALERTA DE AVIAÇÃO] ${badgeText}
=====================================================
Aeronave: ${alert.aircraftDescription} ${alert.registration ? `(${alert.registration})` : ''}
Local: ${alert.locationDescription}
Data: ${alert.eventDate}
Fonte: ${alert.sourceAgency}
Status: ${alert.status}

Resumo: ${alert.summary}

Acesse o dossiê oficial no MGA:
${alert.actionUrl}
=====================================================
  `.trim();

  return { subject, htmlContent, textContent };
}
