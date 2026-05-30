'use client';

import React, { useState } from 'react';
import { MagicLink } from '@/lib/data/mock-settings';
import { Link2, Copy, Send, QrCode, MoreHorizontal, Check, ExternalLink, Download } from 'lucide-react';
import { MagicLinkGeneratorModal } from './MagicLinkGeneratorModal';
import { cn } from '@/lib/utils';

interface OnboardingLinksPanelProps {
  magicLinks: MagicLink[];
  onAddLink: (link: MagicLink) => void;
}

export function OnboardingLinksPanel({ magicLinks, onAddLink }: OnboardingLinksPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [activeQrLinkId, setActiveQrLinkId] = useState<string | null>(null);

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLinkId(id);
    setTimeout(() => {
      setCopiedLinkId(null);
    }, 2000);
  };

  const handleWhatsApp = (link: MagicLink) => {
    const text = encodeURIComponent(`Hola, te invito a unirte a AulaCore mediante este enlace de auto-onboarding: ${link.url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleDownloadQr = (svgId: string, name: string) => {
    const svg = document.getElementById(svgId);
    if (!svg) return;

    const svgSerializer = new XMLSerializer();
    const svgString = svgSerializer.serializeToString(svg);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const DOMURL = window.URL || window.webkitURL || window;
    const svgUrl = DOMURL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const context = canvas.getContext('2d');
      if (context) {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, 300, 300);
        context.drawImage(image, 25, 25, 250, 250);
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `${name.replace(/\s+/g, '_')}_QR.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
      DOMURL.revokeObjectURL(svgUrl);
    };
    image.src = svgUrl;
  };

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full relative">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Link2 className="w-4 h-4 text-indigo-500" /> Enlaces Mágicos Activos
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">Links de autogestión para comunidad educativa</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Generar Enlace
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {magicLinks.map(link => {
            const progress = (link.completed / link.uses) * 100 || 0;
            const abandonedProgress = (link.abandoned / link.uses) * 100 || 0;
            const isCopied = copiedLinkId === link.id;
            const isQrActive = activeQrLinkId === link.id;

            return (
              <div key={link.id} className="p-5 hover:bg-slate-50 transition-colors relative">
                
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-slate-800">{link.name}</h4>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider",
                        link.status === 'Activo' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                      )}>
                        {link.status}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {link.type} &bull; Vence en 7 días
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleWhatsApp(link)}
                      className="p-1.5 hover:bg-white text-slate-400 hover:text-indigo-600 rounded-md transition-colors cursor-pointer" 
                      title="Compartir vía WhatsApp"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setActiveQrLinkId(isQrActive ? null : link.id)}
                      className={cn(
                        "p-1.5 rounded-md transition-colors cursor-pointer",
                        isQrActive ? "bg-indigo-50 text-indigo-600" : "hover:bg-white text-slate-400 hover:text-indigo-600"
                      )} 
                      title="Generar QR"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <a 
                      href={`/configuracion/matricula`} 
                      className="p-1.5 hover:bg-white text-slate-400 hover:text-indigo-600 rounded-md transition-colors" 
                      title="Ver página de registro"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {isQrActive && (
                  <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center animate-in zoom-in-95 duration-200">
                    <div className="w-32 h-32 bg-white border border-slate-200 rounded-lg p-2 flex items-center justify-center shadow-sm">
                      {/* Simple SVG QR Code mockup */}
                      <svg id={`qr-svg-${link.id}`} width="100%" height="100%" viewBox="0 0 100 100" className="text-slate-800">
                        <rect x="0" y="0" width="20" height="20" fill="currentColor" />
                        <rect x="5" y="5" width="10" height="10" fill="white" />
                        <rect x="80" y="0" width="20" height="20" fill="currentColor" />
                        <rect x="85" y="5" width="10" height="10" fill="white" />
                        <rect x="0" y="80" width="20" height="20" fill="currentColor" />
                        <rect x="5" y="85" width="10" height="10" fill="white" />
                        <rect x="30" y="10" width="10" height="15" fill="currentColor" />
                        <rect x="50" y="25" width="15" height="10" fill="currentColor" />
                        <rect x="40" y="45" width="20" height="20" fill="currentColor" />
                        <rect x="70" y="70" width="10" height="15" fill="currentColor" />
                        <rect x="30" y="80" width="15" height="10" fill="currentColor" />
                        <rect x="80" y="40" width="10" height="10" fill="currentColor" />
                      </svg>
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Escanea el código para acceder</p>
                    <button
                      onClick={() => handleDownloadQr(`qr-svg-${link.id}`, link.name)}
                      className="mt-2.5 text-[9px] font-black text-indigo-700 bg-white border border-indigo-200/80 px-2 py-1 rounded-lg shadow-2xs hover:shadow-xs transition duration-200 flex items-center gap-1 cursor-pointer select-none"
                    >
                      <Download className="w-3 h-3 text-indigo-500" /> Descargar PNG
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 bg-slate-100/50 p-2 rounded-lg border border-slate-200/50 mb-4">
                  <span className="truncate flex-1 select-all">{link.url}</span>
                  <button 
                    onClick={() => handleCopy(link.id, link.url)}
                    className={cn(
                      "font-bold px-2 py-1 rounded flex items-center gap-1 transition-all cursor-pointer text-xs",
                      isCopied ? "text-emerald-700 bg-emerald-100" : "text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                    )}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copiar
                      </>
                    )}
                  </button>
                </div>

                {/* Conversion Funnel Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>Conversión: {link.completed}/{link.uses}</span>
                    <span className="text-rose-500">{link.abandoned} Abandonos</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full flex overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all" style={{ width: `${progress}%` }}></div>
                    <div className="bg-rose-400 h-full transition-all" style={{ width: `${abandonedProgress}%` }}></div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {isModalOpen && (
        <MagicLinkGeneratorModal 
          onClose={() => setIsModalOpen(false)} 
          onGenerate={onAddLink}
        />
      )}
    </>
  );
}
