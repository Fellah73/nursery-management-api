import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Nursery Management API — API</title>
          <style>
            *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

            body {
              font-family: 'Segoe UI', system-ui, sans-serif;
              background-color: #0f0f1a;
              background-image:
                radial-gradient(ellipse at 20% 20%, rgba(244,114,182,0.08) 0%, transparent 60%),
                radial-gradient(ellipse at 80% 80%, rgba(168,85,247,0.08) 0%, transparent 60%);
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 40px 20px;
              color: white;
            }

            .card {
              background: rgba(255,255,255,0.04);
              border: 1px solid rgba(255,255,255,0.08);
              border-radius: 24px;
              padding: 56px 64px;
              max-width: 580px;
              width: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 32px;
              backdrop-filter: blur(20px);
              box-shadow: 0 32px 80px rgba(0,0,0,0.4);
            }

            /* ── Header ── */
            .header {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 16px;
              text-align: center;
            }

            .logo {
              width: 56px;
              height: 56px;
              border-radius: 16px;
              background: linear-gradient(135deg, #f472b6, #a855f7);
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 8px 24px rgba(244,114,182,0.3);
            }

            .logo svg {
              width: 30px;
              height: 30px;
            }

            .title {
              font-size: 28px;
              font-weight: 800;
              letter-spacing: -0.5px;
              background: linear-gradient(135deg, #f9a8d4, #c084fc);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }

            .subtitle {
              font-size: 14px;
              color:rgb(169, 174, 186);
              letter-spacing: 0.5px;
            }

            /* ── Divider ── */
            .divider {
              width: 100%;
              height: 1px;
              background: linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent);
            }

            /* ── Description ── */
            .description {
              font-size: 15px;
              color: #9ca3af;
              text-align: center;
              line-height: 1.7;
            }

            /* ── Badges ── */
            .badges {
              display: flex;
              gap: 10px;
              flex-wrap: wrap;
              justify-content: center;
            }

            .badge {
              padding: 6px 14px;
              border-radius: 99px;
              font-size: 12px;
              font-weight: 600;
              letter-spacing: 0.3px;
            }

            .badge-pink  { background: rgba(244,114,182,0.12); color: #f9a8d4; border: 1px solid rgba(244,114,182,0.2); }
            .badge-purple{ background: rgba(168,85,247,0.12);  color: #c4b5fd; border: 1px solid rgba(168,85,247,0.2);  }
            .badge-green { background: rgba(52,211,153,0.10);  color: #6ee7b7; border: 1px solid rgba(52,211,153,0.2);  }

            /* ── Buttons ── */
            .buttons {
              display: flex;
              gap: 12px;
              width: 100%;
            }

            .btn {
              flex: 1;
              padding: 14px 20px;
              border-radius: 14px;
              font-size: 14px;
              font-weight: 700;
              text-decoration: none;
              text-align: center;
              transition: transform 0.2s, box-shadow 0.2s;
              letter-spacing: 0.3px;
            }

            .btn:hover {
              transform: translateY(-2px);
            }

            .btn-primary {
              background: linear-gradient(135deg, #f472b6, #a855f7);
              color: white;
              box-shadow: 0 8px 20px rgba(244,114,182,0.25);
            }

            .btn-primary:hover {
              box-shadow: 0 12px 28px rgba(244,114,182,0.35);
            }

            .btn-secondary {
              background: rgba(255,255,255,0.05);
              color: #d1d5db;
              border: 1px solid rgba(255,255,255,0.08);
            }

            .btn-secondary:hover {
              background: rgba(255,255,255,0.08);
            }

            /* ── Footer ── */
            .footer {
              font-size: 16px;
              color:rgb(143, 152, 167);
              letter-spacing: 0.3px;
            }
          </style>
        </head>
        <body>
          <div class="card">

            <!-- Header -->
            <div class="header">
              <div class="logo">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="54" r="42" fill="white"/>
                  <circle cx="10" cy="52" r="9" fill="white" opacity="0.6"/>
                  <circle cx="90" cy="52" r="9" fill="white" opacity="0.6"/>
                  <circle cx="50" cy="13" r="7" fill="white" opacity="0.5"/>
                  <circle cx="38" cy="16" r="5" fill="white" opacity="0.4"/>
                  <circle cx="62" cy="16" r="5" fill="white" opacity="0.4"/>
                  <circle cx="36" cy="50" r="9" fill="white"/>
                  <circle cx="64" cy="50" r="9" fill="white"/>
                  <circle cx="36" cy="50" r="5" fill="#db2777"/>
                  <circle cx="64" cy="50" r="5" fill="#db2777"/>
                  <circle cx="38" cy="48" r="2" fill="white"/>
                  <circle cx="66" cy="48" r="2" fill="white"/>
                  <ellipse cx="50" cy="61" rx="3.5" ry="2.5" fill="#db2777"/>
                  <path d="M34 72 Q50 86 66 72" stroke="#db2777" stroke-width="3" fill="none" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="title">Nursery Manager — REST API</div>
              <div class="subtitle">NURSERY MANAGEMENT SYSTEM &nbsp;·&nbsp; VERSION 1.0</div>
            </div>

            <div class="divider"></div>

            <!-- Description -->
            <div class="description">
              Official backend API powering the Nursery Management platform.<br/>
              Manage children, staff, meals, schedules, events and more.
            </div>

            <!-- Badges -->
            <div class="badges">
              <span class="badge badge-pink">NestJS</span>
              <span class="badge badge-purple">REST API</span>
              <span class="badge badge-green">Online</span>
            </div>

            <div class="divider"></div>

            <!-- Buttons -->
            <div class="buttons">
              <a href="/docs" class="btn btn-primary">API Documentation</a>
              <a href="/auth/register" class="btn btn-secondary">Register</a>
            </div>

            <!-- Footer -->
            <div class="footer">© 2026 Nursery Management. All rights reserved.</div>

          </div>
        </body>
      </html>
    `;
  }
}
